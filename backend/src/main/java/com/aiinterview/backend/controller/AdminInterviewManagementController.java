package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.AdminInterviewAnalyticsResponse;
import com.aiinterview.backend.dto.AdminInterviewSessionResponse;
import com.aiinterview.backend.dto.AdminReportsResponse;
import com.aiinterview.backend.dto.InterviewSessionResponse;
import com.aiinterview.backend.service.AdminInterviewManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/interviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInterviewManagementController {

    private final AdminInterviewManagementService adminInterviewManagementService;

    @GetMapping("/sessions")
    public ResponseEntity<List<AdminInterviewSessionResponse>> getSessions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) BigDecimal minScore,
            @RequestParam(required = false) BigDecimal maxScore,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String interviewType) {
        return ResponseEntity.ok(adminInterviewManagementService.searchSessions(
                keyword, status, fromDate, toDate, minScore, maxScore, role, level, interviewType));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<InterviewSessionResponse> getSessionDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminInterviewManagementService.getSessionDetail(id));
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminInterviewAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminInterviewManagementService.getInterviewAnalytics());
    }

    @GetMapping("/reports")
    public ResponseEntity<AdminReportsResponse> getReports() {
        return ResponseEntity.ok(adminInterviewManagementService.getReports());
    }

    @GetMapping(value = "/reports/export", produces = "text/csv")
    public ResponseEntity<String> exportReports(@RequestParam(required = false, defaultValue = "all") String type) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin-reports.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(adminInterviewManagementService.exportReportCsv(type));
    }
}
