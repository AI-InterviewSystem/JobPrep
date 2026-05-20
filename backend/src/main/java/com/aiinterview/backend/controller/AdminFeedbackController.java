package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.FeedbackHistoryResponse;
import com.aiinterview.backend.dto.FeedbackResponse;
import com.aiinterview.backend.dto.FeedbackStatusUpdateRequest;
import com.aiinterview.backend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/feedbacks")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<FeedbackResponse> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody FeedbackStatusUpdateRequest request) {
        String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(feedbackService.updateFeedbackStatus(id, request, adminEmail));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<FeedbackHistoryResponse>> getFeedbackHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(feedbackService.getFeedbackHistory(id));
    }
}
