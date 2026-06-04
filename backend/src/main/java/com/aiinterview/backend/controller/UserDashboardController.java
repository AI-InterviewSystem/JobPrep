package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.UserDashboardResponse;
import com.aiinterview.backend.service.UserDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class UserDashboardController {

    private final UserDashboardService userDashboardService;

    @GetMapping
    public ResponseEntity<UserDashboardResponse> getDashboard() {
        return ResponseEntity.ok(userDashboardService.getDashboard());
    }
}
