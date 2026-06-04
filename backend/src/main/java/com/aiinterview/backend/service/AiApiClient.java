package com.aiinterview.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiApiClient {

    private RestTemplate restTemplate = createRestTemplate();

    @Value("${ai.server.url}")
    private String aiServerUrl;

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(120_000);

        RestTemplate restTemplate = new RestTemplate(factory);
        restTemplate.getMessageConverters().add(0, new FormHttpMessageConverter());
        restTemplate.getMessageConverters().add(1, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        return restTemplate;
    }

    public String extractCv(MultipartFile file) {
        try {
            return extractCv(file.getBytes(), file.getOriginalFilename(), file.getContentType());
        } catch (Exception e) {
            throw wrapAiError("extract CV", e);
        }
    }

    public String extractCv(byte[] fileBytes, String filename, String contentType) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", buildFileResource(fileBytes, filename, contentType));
        return postMultipart("/extract-cv", body);
    }

    public String startInterview(Map<String, Object> requestBody) {
        return postJson("/interview/start", requestBody, "start interview", 3);
    }

    public String submitAnswer(Map<String, Object> requestBody) {
        return postJson("/interview/answer", requestBody, "submit answer", 4);
    }

    public String submitQuestionBankPracticeAnswer(String sessionId, Map<String, Object> requestBody) {
        return postJson(
                "/ai-interview/question-bank/practice/sessions/" + sessionId + "/answers",
                requestBody,
                "score question bank practice answer",
                4);
    }

    public String getSummary(Map<String, Object> requestBody) {
        return postJson("/interview/summary", requestBody, "get interview summary", 3);
    }

    public String checkCvJd(Map<String, Object> requestBody) {
        return postJson("/check-cv-jd", requestBody, "check CV/JD", 2);
    }

    public String checkCvJdFile(MultipartFile file, String jobDescription) {
        return sendMultipartWithJobDescription(file, jobDescription, "/check-cv-jd-file");
    }

    public String extractAndCheck(MultipartFile file, String jobDescription) {
        return sendMultipartWithJobDescription(file, jobDescription, "/extract-and-check");
    }

    private String sendMultipartWithJobDescription(MultipartFile file, String jobDescription, String endpoint) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", buildFileResource(file.getBytes(), file.getOriginalFilename(), file.getContentType()));
            body.add("job_description", jobDescription);
            return postMultipart(endpoint, body);
        } catch (Exception e) {
            throw wrapAiError(endpoint, e);
        }
    }

    private ByteArrayResource buildFileResource(byte[] fileBytes, String filename, String contentType) {
        return new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return filename != null ? filename : "resume.pdf";
            }
        };
    }

    private String postMultipart(String endpoint, MultiValueMap<String, Object> body) {
        try {
            // Do NOT set Content-Type manually; FormHttpMessageConverter adds boundary.
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    endpointUrl(endpoint),
                    requestEntity,
                    String.class);
            return response.getBody();
        } catch (HttpStatusCodeException e) {
            log.error("AI API {} returned {}: {}", endpoint, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "AI API " + endpoint + " failed (" + e.getStatusCode() + "): " + e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            log.error("AI API {} request failed: {}", endpoint, e.getMessage(), e);
            throw new RuntimeException("AI API " + endpoint + " failed: " + e.getMessage(), e);
        }
    }

    private RuntimeException wrapAiError(String action, Exception e) {
        if (e instanceof RuntimeException runtimeException) {
            return runtimeException;
        }
        log.error("Error during {} via AI API: {}", action, e.getMessage(), e);
        return new RuntimeException("Failed to " + action + ": " + e.getMessage(), e);
    }

    public String generateQuestions(Map<String, Object> requestBody) {
        return postJson("/generate-questions", requestBody, "generate questions", 3);
    }

    private String postJson(String endpoint, Map<String, Object> requestBody, String action, int maxAttempts) {
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
                HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(
                        endpointUrl(endpoint),
                        requestEntity,
                        String.class);
                return response.getBody();
            } catch (HttpStatusCodeException e) {
                String responseBody = e.getResponseBodyAsString();
                if (shouldRetryAiError(e, responseBody) && attempt < maxAttempts) {
                    long delayMillis = retryDelayMillis(attempt);
                    log.warn("AI API {} failed on attempt {}/{} with {}. Retrying in {} ms. Body: {}",
                            endpoint, attempt, maxAttempts, e.getStatusCode(), delayMillis, responseBody);
                    sleep(delayMillis);
                    continue;
                }
                String message = buildAiErrorMessage(action, responseBody);
                if (isAiRateLimitMessage(responseBody)) {
                    log.warn("AI API {} is rate-limited after {}/{} attempts with {}: {}",
                            endpoint, attempt, maxAttempts, e.getStatusCode(), responseBody);
                    throw new AiProviderRateLimitException(message, e);
                }
                if (isAiInvalidResponseMessage(responseBody)) {
                    log.warn("AI API {} returned an invalid AI response after {}/{} attempts with {}: {}",
                            endpoint, attempt, maxAttempts, e.getStatusCode(), responseBody);
                    throw new AiProviderInvalidResponseException(message, e);
                }
                log.error("AI API {} failed after {}/{} attempts with {}: {}",
                        endpoint, attempt, maxAttempts, e.getStatusCode(), responseBody);
                throw new RuntimeException(message, e);
            } catch (Exception e) {
                if (attempt < maxAttempts) {
                    long delayMillis = retryDelayMillis(attempt);
                    log.warn("AI API {} request failed on attempt {}/{}. Retrying in {} ms: {}",
                            endpoint, attempt, maxAttempts, delayMillis, e.getMessage());
                    sleep(delayMillis);
                    continue;
                }
                log.error("AI API {} request failed after {}/{} attempts: {}",
                        endpoint, attempt, maxAttempts, e.getMessage(), e);
                throw new RuntimeException("AI API failed to " + action + ": " + e.getMessage(), e);
            }
        }
        throw new RuntimeException("AI API failed to " + action);
    }

    private boolean shouldRetryAiError(HttpStatusCodeException e, String responseBody) {
        int statusCode = e.getStatusCode().value();
        if (statusCode == 429 || e.getStatusCode().is5xxServerError()) {
            return true;
        }
        String body = responseBody != null ? responseBody.toLowerCase() : "";
        return body.contains("429") || body.contains("rate limit") || body.contains("rate-limit");
    }

    private long retryDelayMillis(int attempt) {
        return switch (attempt) {
            case 1 -> 3_000L;
            case 2 -> 8_000L;
            default -> 15_000L;
        };
    }

    private void sleep(long delayMillis) {
        try {
            Thread.sleep(delayMillis);
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
        }
    }

    private String buildAiErrorMessage(String action, String responseBody) {
        String body = responseBody != null ? responseBody : "";
        String lowerBody = body.toLowerCase();
        if (isAiRateLimitMessage(body)) {
            return "AI provider is temporarily rate-limited while trying to " + action
                    + ". Please wait a minute and try again.";
        }
        if (isAiInvalidResponseMessage(body)) {
            return "AI service returned an invalid or incomplete response while trying to " + action
                    + ". The interview data was saved and can continue in degraded mode.";
        }
        return "AI API failed to " + action + (body.isBlank() ? "" : ": " + body);
    }

    private boolean isAiRateLimitMessage(String responseBody) {
        String body = responseBody != null ? responseBody.toLowerCase() : "";
        return body.contains("429") || body.contains("rate limit") || body.contains("rate-limit");
    }

    private boolean isAiInvalidResponseMessage(String responseBody) {
        String body = responseBody != null ? responseBody.toLowerCase() : "";
        return body.contains("unterminated string")
                || body.contains("jsondecode")
                || body.contains("json decode")
                || body.contains("invalid json")
                || body.contains("incomplete response")
                || body.contains("failed to parse");
    }

    private String endpointUrl(String endpoint) {
        String baseUrl = aiServerUrl != null ? aiServerUrl.trim() : "";
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + endpoint;
    }

    public static class AiProviderRateLimitException extends RuntimeException {
        public AiProviderRateLimitException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class AiProviderInvalidResponseException extends RuntimeException {
        public AiProviderInvalidResponseException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
