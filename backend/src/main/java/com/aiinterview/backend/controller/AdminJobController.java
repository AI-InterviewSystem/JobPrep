package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.JobCategoryRequest;
import com.aiinterview.backend.dto.JobCategoryResponse;
import com.aiinterview.backend.dto.JobRoleRequest;
import com.aiinterview.backend.dto.JobRoleResponse;
import com.aiinterview.backend.service.JobManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/jobs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminJobController {

    private final JobManagementService jobService;

    @GetMapping("/categories")
    public ResponseEntity<List<JobCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(jobService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<JobCategoryResponse> createCategory(@Valid @RequestBody JobCategoryRequest request) {
        return ResponseEntity.ok(jobService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<JobCategoryResponse> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody JobCategoryRequest request) {
        return ResponseEntity.ok(jobService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        jobService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/roles")
    public ResponseEntity<JobRoleResponse> createRole(@Valid @RequestBody JobRoleRequest request) {
        return ResponseEntity.ok(jobService.createRole(request));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<JobRoleResponse> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody JobRoleRequest request) {
        return ResponseEntity.ok(jobService.updateRole(id, request));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        jobService.deleteRole(id);
        return ResponseEntity.ok().build();
    }
}
