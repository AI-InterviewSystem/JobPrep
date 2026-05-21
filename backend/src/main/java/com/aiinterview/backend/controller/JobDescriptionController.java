package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.JobDescriptionRequest;
import com.aiinterview.backend.dto.JobDescriptionResponse;
import com.aiinterview.backend.service.JobDescriptionService;
import com.aiinterview.backend.service.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/job-descriptions")
@RequiredArgsConstructor
public class JobDescriptionController {

    private final JobDescriptionService jobDescriptionService;

    @PostMapping
    public ResponseEntity<JobDescriptionResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JobDescriptionRequest request) {
        UUID userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(jobDescriptionService.create(request, userId));
    }

    @GetMapping
    public ResponseEntity<List<JobDescriptionResponse>> getJobDescriptions(
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(jobDescriptionService.getJobDescriptions(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDescriptionResponse> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getId() : null;
        return ResponseEntity.ok(jobDescriptionService.getById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal != null ? principal.getId() : null;
        jobDescriptionService.delete(id, userId);
        return ResponseEntity.ok().build();
    }
}
