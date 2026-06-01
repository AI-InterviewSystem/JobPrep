package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.CreateInterviewSessionRequest;
import com.aiinterview.backend.dto.InterviewRecordingResponse;
import com.aiinterview.backend.dto.InterviewSessionResponse;
import com.aiinterview.backend.dto.StartInterviewSessionRequest;
import com.aiinterview.backend.dto.SubmitAnswerRequest;
import com.aiinterview.backend.dto.SubmitAnswerResponse;
import com.aiinterview.backend.service.InterviewRecordingService;
import com.aiinterview.backend.service.InterviewSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/interview-sessions")
@RequiredArgsConstructor
public class InterviewSessionController {

    private final InterviewSessionService interviewSessionService;
    private final InterviewRecordingService interviewRecordingService;

    @PostMapping
    public ResponseEntity<InterviewSessionResponse> createSession(
            Authentication auth,
            @RequestBody CreateInterviewSessionRequest request) {
        return ResponseEntity.ok(
                interviewSessionService.createSession(auth.getName(), request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewSessionResponse> getSession(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(interviewSessionService.getSession(id, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<InterviewSessionResponse>> getUserSessions(
            Authentication auth,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) BigDecimal minScore,
            @RequestParam(required = false) BigDecimal maxScore,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String interviewType,
            @RequestParam(required = false) String topic) {
        return ResponseEntity.ok(interviewSessionService.searchUserSessions(
                auth.getName(),
                keyword,
                status,
                fromDate,
                toDate,
                minScore,
                maxScore,
                role,
                level,
                interviewType,
                topic
        ));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<InterviewSessionResponse> startSession(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody(required = false) StartInterviewSessionRequest request) {
        return ResponseEntity.ok(interviewSessionService.startSession(id, auth.getName(), request));
    }

    @PostMapping("/{id}/answers")
    public ResponseEntity<SubmitAnswerResponse> submitAnswer(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody SubmitAnswerRequest request) {
        return ResponseEntity.ok(interviewSessionService.submitAnswer(id, auth.getName(), request));
    }

    @PostMapping(value = "/{id}/recordings", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InterviewRecordingResponse> uploadRecording(
            Authentication auth,
            @PathVariable UUID id,
            @RequestParam UUID questionId,
            @RequestParam(required = false) UUID answerId,
            @RequestParam(required = false, defaultValue = "video") String recordingType,
            @RequestParam(required = false) Integer durationSeconds,
            @RequestParam(required = false) String transcriptText,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(interviewRecordingService.uploadRecording(
                id,
                auth.getName(),
                questionId,
                answerId,
                recordingType,
                durationSeconds,
                transcriptText,
                file
        ));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<InterviewSessionResponse> completeSession(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(interviewSessionService.completeSession(id, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            Authentication auth,
            @PathVariable UUID id) {
        interviewSessionService.deleteSession(id, auth.getName());
        return ResponseEntity.ok().build();
    }
}
