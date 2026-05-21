package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.JobCategoryResponse;
import com.aiinterview.backend.service.JobManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jobs/categories")
@RequiredArgsConstructor
public class JobCategoryController {

    private final JobManagementService jobService;

    @GetMapping
    public ResponseEntity<List<JobCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(jobService.getAllCategories());
    }
}
