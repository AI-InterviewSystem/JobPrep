package com.aiinterview.backend.controller;

import com.aiinterview.backend.service.AiApiClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Proxies webcam behavior-monitoring requests to the AI server.
 * The frontend must NOT call the AI server directly; all traffic goes through
 * here.
 */
@RestController
@RequestMapping("/behavior")
@RequiredArgsConstructor
@Slf4j
public class BehaviorController {

    private final AiApiClient aiApiClient;

    /**
     * POST /behavior/start
     * Start a new webcam behavior monitoring session on the AI server.
     */
    @PostMapping("/start")
    public ResponseEntity<String> startMonitoring(Authentication auth) {
        log.info("[Behavior] start monitoring for user={}", auth.getName());
        String result = aiApiClient.startBehaviorMonitoring();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }

    /**
     * POST /behavior/frame
     * Upload one webcam frame (multipart/form-data) and receive face/gaze analysis.
     *
     * @param sessionId behavior session id returned by /behavior/start
     * @param file      webcam frame image (JPG or PNG)
     * @param timestamp optional unix timestamp (seconds); server time used if
     *                  omitted
     */
    @PostMapping(value = "/frame", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> sendFrame(
            Authentication auth,
            @RequestParam("session_id") String sessionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "timestamp", required = false) String timestamp) {
        try {
            log.debug("[Behavior] frame upload for behaviorSession={}, user={}", sessionId, auth.getName());
            String result = aiApiClient.sendBehaviorFrame(
                    file.getBytes(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    sessionId,
                    timestamp);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result);
        } catch (Exception e) {
            log.error("[Behavior] frame upload error for session={}: {}", sessionId, e.getMessage());
            // Return a graceful degraded response so the interview can continue
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"session_id\":\"" + sessionId
                            + "\",\"status\":\"in_progress\",\"face_count\":0,\"is_looking_away\":false,\"looking_away_duration_seconds\":0.0,\"warnings\":[],\"error\":\"frame_upload_failed\"}");
        }
    }

    /**
     * POST /behavior/end
     * End a behavior monitoring session and receive the full behavior report.
     *
     * @param body JSON with { "session_id": "<uuid>" }
     */
    @PostMapping("/end")
    public ResponseEntity<String> endMonitoring(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        String sessionId = body.getOrDefault("session_id", "").toString();
        log.info("[Behavior] end monitoring for behaviorSession={}, user={}", sessionId, auth.getName());
        try {
            String result = aiApiClient.endBehaviorMonitoring(body);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result);
        } catch (Exception e) {
            log.error("[Behavior] end monitoring error for session={}: {}", sessionId, e.getMessage());
            // Return a minimal report so the result page still renders
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"session_id\":\"" + sessionId
                            + "\",\"status\":\"completed\",\"duration_seconds\":0,\"total_frames\":0,\"valid_face_frames\":0,\"no_face_frames\":0,\"multiple_face_frames\":0,\"looking_away_frames\":0,\"warnings\":[],\"summary\":{\"risk_level\":\"unknown\",\"valid_face_ratio\":0.0,\"looking_away_ratio\":0.0,\"warning_counts\":{}}}");
        }
    }
}
