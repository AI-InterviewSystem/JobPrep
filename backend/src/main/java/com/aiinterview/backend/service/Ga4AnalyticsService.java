package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.AdminDashboardResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class Ga4AnalyticsService {

    private static final String ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String DATA_API_BASE = "https://analyticsdata.googleapis.com/v1beta/properties/";

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${analytics.ga4.property-id:}")
    private String propertyId;

    @Value("${analytics.ga4.client-email:}")
    private String clientEmail;

    @Value("${analytics.ga4.private-key:}")
    private String privateKey;

    @Value("${analytics.ga4.measurement-id:G-1H60JLMP97}")
    private String measurementId;

    private String accessToken;
    private Instant accessTokenExpiresAt = Instant.EPOCH;

    public AdminDashboardResponse.Ga4Analytics getAnalytics() {
        if (!isConfigured()) {
            return disabled("GA4 is not configured. Set GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY on the backend.");
        }

        try {
            String token = getAccessToken();
            Map<String, Object> summary = runReport(token, Map.of(
                    "dateRanges", List.of(Map.of("startDate", "30daysAgo", "endDate", "today")),
                    "metrics", List.of(
                            metric("activeUsers"),
                            metric("totalUsers"),
                            metric("sessions"),
                            metric("screenPageViews"),
                            metric("engagementRate"),
                            metric("bounceRate"),
                            metric("averageSessionDuration"))));

            Map<String, Object> realtime = runRealtimeReport(token, Map.of(
                    "metrics", List.of(metric("activeUsers"))));

            Map<String, Object> daily = runReport(token, Map.of(
                    "dateRanges", List.of(Map.of("startDate", "30daysAgo", "endDate", "today")),
                    "dimensions", List.of(dimension("date")),
                    "metrics", List.of(metric("activeUsers")),
                    "orderBys", List.of(Map.of("dimension", Map.of("dimensionName", "date")))));

            Map<String, Object> pages = runReport(token, Map.of(
                    "dateRanges", List.of(Map.of("startDate", "30daysAgo", "endDate", "today")),
                    "dimensions", List.of(dimension("pageTitle"), dimension("pagePath")),
                    "metrics", List.of(metric("screenPageViews"), metric("activeUsers")),
                    "limit", 5,
                    "orderBys", List.of(Map.of("metric", Map.of("metricName", "screenPageViews"), "desc", true))));

            Map<String, Object> sources = runReport(token, Map.of(
                    "dateRanges", List.of(Map.of("startDate", "30daysAgo", "endDate", "today")),
                    "dimensions", List.of(dimension("sessionSourceMedium")),
                    "metrics", List.of(metric("sessions"), metric("totalUsers")),
                    "limit", 5,
                    "orderBys", List.of(Map.of("metric", Map.of("metricName", "sessions"), "desc", true))));

            return AdminDashboardResponse.Ga4Analytics.builder()
                    .configured(true)
                    .statusMessage("Live GA4 data from the last 30 days")
                    .measurementId(measurementId)
                    .propertyId(propertyId)
                    .realtimeActiveUsers(metricAsLong(realtime, 0, 0))
                    .activeUsers(metricAsLong(summary, 0, 0))
                    .totalUsers(metricAsLong(summary, 0, 1))
                    .sessions(metricAsLong(summary, 0, 2))
                    .pageViews(metricAsLong(summary, 0, 3))
                    .engagementRate(metricAsDouble(summary, 0, 4))
                    .bounceRate(metricAsDouble(summary, 0, 5))
                    .averageSessionDuration(metricAsDouble(summary, 0, 6))
                    .dailyActiveUsers(toDailyActiveUsers(daily))
                    .topPages(toTopPages(pages))
                    .trafficSources(toTrafficSources(sources))
                    .build();
        } catch (Exception ex) {
            return disabled(toStatusMessage(ex));
        }
    }

    private String toStatusMessage(Exception ex) {
        String message = ex.getMessage();
        if (message == null) {
            return "Unable to load GA4 data.";
        }
        if (message.contains("403") || message.contains("PERMISSION_DENIED")) {
            return "GA4 permission denied. Add the service account as a Viewer or Analyst on this GA4 property.";
        }
        if (message.contains("404") || message.contains("NOT_FOUND")) {
            return "GA4 property was not found. Check the numeric GA4 property ID.";
        }
        if (message.contains("invalid_grant") || message.contains("private_key")) {
            return "GA4 credentials are invalid. Check the service account email and private key.";
        }
        return "Unable to load GA4 data.";
    }

    private boolean isConfigured() {
        return StringUtils.hasText(propertyId) && StringUtils.hasText(clientEmail) && StringUtils.hasText(privateKey);
    }

    private AdminDashboardResponse.Ga4Analytics disabled(String message) {
        return AdminDashboardResponse.Ga4Analytics.builder()
                .configured(false)
                .statusMessage(message)
                .measurementId(measurementId)
                .propertyId(propertyId)
                .realtimeActiveUsers(0L)
                .activeUsers(0L)
                .totalUsers(0L)
                .sessions(0L)
                .pageViews(0L)
                .engagementRate(0.0)
                .bounceRate(0.0)
                .averageSessionDuration(0.0)
                .dailyActiveUsers(Collections.emptyList())
                .topPages(Collections.emptyList())
                .trafficSources(Collections.emptyList())
                .build();
    }

    private String getAccessToken() throws Exception {
        if (StringUtils.hasText(accessToken) && Instant.now().isBefore(accessTokenExpiresAt.minusSeconds(60))) {
            return accessToken;
        }

        String assertion = createSignedJwt();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String body = "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + assertion;

        Map<?, ?> response = restTemplate.postForObject(TOKEN_URL, new HttpEntity<>(body, headers), Map.class);
        if (response == null || response.get("access_token") == null) {
            throw new IllegalStateException("Google OAuth token response was empty");
        }

        accessToken = response.get("access_token").toString();
        Object expiresInValue = response.get("expires_in");
        Number expiresIn = expiresInValue instanceof Number ? (Number) expiresInValue : 3600;
        accessTokenExpiresAt = Instant.now().plusSeconds(expiresIn.longValue());
        return accessToken;
    }

    private String createSignedJwt() throws Exception {
        Instant now = Instant.now();
        Map<String, Object> header = Map.of("alg", "RS256", "typ", "JWT");
        Map<String, Object> claim = new HashMap<>();
        claim.put("iss", clientEmail);
        claim.put("scope", ANALYTICS_SCOPE);
        claim.put("aud", TOKEN_URL);
        claim.put("iat", now.getEpochSecond());
        claim.put("exp", now.plusSeconds(3600).getEpochSecond());

        String unsigned = base64UrlJson(header) + "." + base64UrlJson(claim);
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(loadPrivateKey());
        signature.update(unsigned.getBytes(StandardCharsets.UTF_8));
        return unsigned + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(signature.sign());
    }

    private PrivateKey loadPrivateKey() throws Exception {
        String key = privateKey.replace("\\n", "\n")
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");
        byte[] decoded = Base64.getDecoder().decode(key);
        return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    private String base64UrlJson(Map<String, Object> payload) throws JsonProcessingException {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(objectMapper.writeValueAsBytes(payload));
    }

    private Map<String, Object> runReport(String token, Map<String, Object> body) {
        return postAnalytics(token, DATA_API_BASE + propertyId + ":runReport", body);
    }

    private Map<String, Object> runRealtimeReport(String token, Map<String, Object> body) {
        return postAnalytics(token, DATA_API_BASE + propertyId + ":runRealtimeReport", body);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> postAnalytics(String token, String url, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        try {
            Map<String, Object> response = restTemplate.postForObject(url, new HttpEntity<>(body, headers), Map.class);
            return response != null ? response : Collections.emptyMap();
        } catch (RestClientException ex) {
            throw new IllegalStateException(ex.getMessage(), ex);
        }
    }

    private Map<String, String> metric(String name) {
        return Map.of("name", name);
    }

    private Map<String, String> dimension(String name) {
        return Map.of("name", name);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> rows(Map<String, Object> response) {
        Object value = response.get("rows");
        return value instanceof List<?> ? (List<Map<String, Object>>) value : Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    private String metricValue(Map<String, Object> response, int rowIndex, int metricIndex) {
        List<Map<String, Object>> rows = rows(response);
        if (rows.size() <= rowIndex) {
            return "0";
        }
        Object metricValues = rows.get(rowIndex).get("metricValues");
        if (!(metricValues instanceof List<?> values) || values.size() <= metricIndex) {
            return "0";
        }
        Object metric = ((Map<String, Object>) values.get(metricIndex)).get("value");
        return metric != null ? metric.toString() : "0";
    }

    private long metricAsLong(Map<String, Object> response, int rowIndex, int metricIndex) {
        return Math.round(metricAsDouble(response, rowIndex, metricIndex));
    }

    private double metricAsDouble(Map<String, Object> response, int rowIndex, int metricIndex) {
        try {
            return Double.parseDouble(metricValue(response, rowIndex, metricIndex));
        } catch (NumberFormatException ex) {
            return 0.0;
        }
    }

    @SuppressWarnings("unchecked")
    private String dimensionValue(Map<String, Object> row, int index) {
        Object dimensionValues = row.get("dimensionValues");
        if (!(dimensionValues instanceof List<?> values) || values.size() <= index) {
            return "Unknown";
        }
        Object dimension = ((Map<String, Object>) values.get(index)).get("value");
        return dimension != null && StringUtils.hasText(dimension.toString()) ? dimension.toString() : "Unknown";
    }

    private List<AdminDashboardResponse.ChartDataPoint> toDailyActiveUsers(Map<String, Object> response) {
        List<AdminDashboardResponse.ChartDataPoint> points = new ArrayList<>();
        for (Map<String, Object> row : rows(response)) {
            points.add(new AdminDashboardResponse.ChartDataPoint(formatGaDate(dimensionValue(row, 0)), metricAsDouble(Map.of("rows", List.of(row)), 0, 0)));
        }
        return points;
    }

    private List<AdminDashboardResponse.TopPage> toTopPages(Map<String, Object> response) {
        List<AdminDashboardResponse.TopPage> pages = new ArrayList<>();
        for (Map<String, Object> row : rows(response)) {
            Map<String, Object> singleRow = Map.of("rows", List.of(row));
            pages.add(AdminDashboardResponse.TopPage.builder()
                    .title(dimensionValue(row, 0))
                    .path(dimensionValue(row, 1))
                    .views(metricAsLong(singleRow, 0, 0))
                    .activeUsers(metricAsLong(singleRow, 0, 1))
                    .build());
        }
        return pages;
    }

    private List<AdminDashboardResponse.TrafficSource> toTrafficSources(Map<String, Object> response) {
        List<AdminDashboardResponse.TrafficSource> sources = new ArrayList<>();
        for (Map<String, Object> row : rows(response)) {
            Map<String, Object> singleRow = Map.of("rows", List.of(row));
            sources.add(AdminDashboardResponse.TrafficSource.builder()
                    .source(dimensionValue(row, 0))
                    .sessions(metricAsLong(singleRow, 0, 0))
                    .totalUsers(metricAsLong(singleRow, 0, 1))
                    .build());
        }
        return sources;
    }

    private String formatGaDate(String value) {
        if (value.length() != 8) {
            return value;
        }
        return value.substring(0, 4) + "-" + value.substring(4, 6) + "-" + value.substring(6, 8);
    }
}



