package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.JobGroupResponse;
import com.aiinterview.backend.service.JobManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/jobs/groups")
@RequiredArgsConstructor
public class JobGroupController {

    private final JobManagementService jobService;

    @GetMapping
    public ResponseEntity<List<JobGroupResponse>> getAllGroups() {
        return ResponseEntity.ok(jobService.getAllGroups());
    }
}
