package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.FeedbackRequest;
import com.aiinterview.backend.dto.FeedbackResponse;
import com.aiinterview.backend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<FeedbackResponse> submitFeedback(@Valid @RequestBody FeedbackRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feedbackService.submitFeedback(request, email));
    }

    @GetMapping("/me")
    public ResponseEntity<List<FeedbackResponse>> getMyFeedbacks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(feedbackService.getMyFeedbacks(email));
    }
}
