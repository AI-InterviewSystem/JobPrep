package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.service.JobManagementService;
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
public class AdminJobManagementController {

    private final JobManagementService jobManagementService;

    @GetMapping("/groups")
    public ResponseEntity<List<JobGroupResponse>> getGroups() {
        return ResponseEntity.ok(jobManagementService.getGroups());
    }

    @PostMapping("/groups")
    public ResponseEntity<JobGroupResponse> createGroup(@RequestBody JobGroupRequest request) {
        return ResponseEntity.ok(jobManagementService.createGroup(request));
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<JobGroupResponse> updateGroup(@PathVariable UUID id, @RequestBody JobGroupRequest request) {
        return ResponseEntity.ok(jobManagementService.updateGroup(id, request));
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable UUID id) {
        jobManagementService.deleteGroup(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<JobCategoryResponse>> getCategories(@RequestParam(required = false) UUID groupId) {
        return ResponseEntity.ok(jobManagementService.getCategories(groupId));
    }

    @PostMapping("/categories")
    public ResponseEntity<JobCategoryResponse> createCategory(@RequestBody JobCategoryRequest request) {
        return ResponseEntity.ok(jobManagementService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<JobCategoryResponse> updateCategory(@PathVariable UUID id, @RequestBody JobCategoryRequest request) {
        return ResponseEntity.ok(jobManagementService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        jobManagementService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<JobRoleResponse>> getRoles(@RequestParam(required = false) UUID categoryId) {
        return ResponseEntity.ok(jobManagementService.getRoles(categoryId));
    }

    @PostMapping("/roles")
    public ResponseEntity<JobRoleResponse> createRole(@RequestBody JobRoleRequest request) {
        return ResponseEntity.ok(jobManagementService.createRole(request));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<JobRoleResponse> updateRole(@PathVariable UUID id, @RequestBody JobRoleRequest request) {
        return ResponseEntity.ok(jobManagementService.updateRole(id, request));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        jobManagementService.deleteRole(id);
        return ResponseEntity.ok().build();
    }
}
