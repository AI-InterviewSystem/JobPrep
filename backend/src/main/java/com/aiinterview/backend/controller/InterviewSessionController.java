package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.CreateInterviewSessionRequest;
import com.aiinterview.backend.dto.InterviewSessionResponse;
import com.aiinterview.backend.dto.StartInterviewSessionRequest;
import com.aiinterview.backend.dto.SubmitAnswerRequest;
import com.aiinterview.backend.service.InterviewSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/interview-sessions")
@RequiredArgsConstructor
public class InterviewSessionController {

    private final InterviewSessionService interviewSessionService;

    @PostMapping
    public ResponseEntity<InterviewSessionResponse> createSession(
            Authentication auth,
            @RequestBody CreateInterviewSessionRequest request) {
        return ResponseEntity.ok(
                interviewSessionService.createSession(auth.getName(), request.getJobDescriptionId())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewSessionResponse> getSession(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(interviewSessionService.getSession(id, auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<InterviewSessionResponse>> getUserSessions(Authentication auth) {
        return ResponseEntity.ok(interviewSessionService.getUserSessions(auth.getName()));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<InterviewSessionResponse> startSession(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody(required = false) StartInterviewSessionRequest request) {
        return ResponseEntity.ok(interviewSessionService.startSession(id, auth.getName(), request));
    }

    @PostMapping("/{id}/answers")
    public ResponseEntity<Void> submitAnswer(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody SubmitAnswerRequest request) {
        interviewSessionService.submitAnswer(id, auth.getName(), request);
        return ResponseEntity.ok().build();
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
