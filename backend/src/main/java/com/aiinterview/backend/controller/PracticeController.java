package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.PracticeAnswerResponse;
import com.aiinterview.backend.dto.PracticeSessionResponse;
import com.aiinterview.backend.dto.StartPracticeSessionRequest;
import com.aiinterview.backend.dto.SubmitPracticeAnswerRequest;
import com.aiinterview.backend.service.PracticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/question-bank/practice")
@RequiredArgsConstructor
public class PracticeController {

    private final PracticeService practiceService;

    @PostMapping("/sessions")
    public ResponseEntity<PracticeSessionResponse> startSession(@RequestBody StartPracticeSessionRequest request) {
        return ResponseEntity.ok(practiceService.startSession(request));
    }

    @PostMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<PracticeAnswerResponse> submitAnswer(
            @PathVariable UUID sessionId,
            @RequestBody SubmitPracticeAnswerRequest request) {
        return ResponseEntity.ok(practiceService.submitAnswer(sessionId, request));
    }

    @GetMapping("/sessions/{sessionId}/answers")
    public ResponseEntity<List<PracticeAnswerResponse>> getAnswers(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(practiceService.getSessionAnswers(sessionId));
    }
}
