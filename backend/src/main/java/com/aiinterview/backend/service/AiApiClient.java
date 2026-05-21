package com.aiinterview.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiApiClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Gemini-Api-Key", apiKey);
        return headers;
    }

    public String extractCv(MultipartFile file) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            // Wrap multipart file into ByteArrayResource for RestTemplate
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServerUrl + "/extract-cv",
                    requestEntity,
                    String.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error extracting CV via AI API: {}", e.getMessage());
            throw new RuntimeException("Failed to extract CV", e);
        }
    }

    public String startInterview(Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServerUrl + "/interview/start",
                    requestEntity,
                    String.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error starting interview via AI API: {}", e.getMessage());
            throw new RuntimeException("Failed to start interview", e);
        }
    }

    public String submitAnswer(Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServerUrl + "/interview/answer",
                    requestEntity,
                    String.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error submitting answer via AI API: {}", e.getMessage());
            throw new RuntimeException("Failed to submit answer", e);
        }
    }

    public String getSummary(Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServerUrl + "/interview/summary",
                    requestEntity,
                    String.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error getting interview summary via AI API: {}", e.getMessage());
            throw new RuntimeException("Failed to get interview summary", e);
        }
    }

    public String checkCvJd(Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServerUrl + "/check-cv-jd",
                    requestEntity,
                    String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error in checkCvJd via AI API: {}", e.getMessage());
            throw new RuntimeException("Failed to check CV jd", e);
        }
    }

    public String checkCvJdFile(MultipartFile file, String jobDescription) {
        return sendMultipartWithJobDescription(file, jobDescription, "/check-cv-jd-file");
    }

    public String extractAndCheck(MultipartFile file, String jobDescription) {
        return sendMultipartWithJobDescription(file, jobDescription, "/extract-and-check");
    }

    private String sendMultipartWithJobDescription(MultipartFile file, String jobDescription, String endpoint) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", resource);
            body.add("job_description", jobDescription);
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServerUrl + endpoint,
                    requestEntity,
                    String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling {} via AI API: {}", endpoint, e.getMessage());
            throw new RuntimeException("Failed to call " + endpoint, e);
        }
    }

    public String generateQuestions(Map<String, Object> requestBody) {
        try {
            HttpHeaders headers = createHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServerUrl + "/generate-questions",
                    requestEntity,
                    String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error generating questions via AI API: {}", e.getMessage());
            throw new RuntimeException("Failed to generate questions", e);
        }
    }
}
