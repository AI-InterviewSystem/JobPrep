package com.aiinterview.backend.controller;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.service.AiApiClient;
import com.aiinterview.backend.service.CvUploadService;
import com.aiinterview.backend.service.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/ai-helpers")
@RequiredArgsConstructor
public class AiHelperController {

    private final AiApiClient aiApiClient;
    private final CvUploadService cvUploadService;
    private final UserRepository userRepository;

    @PostMapping("/check-cv-jd")
    public ResponseEntity<String> checkCvJd(@RequestBody Map<String, Object> body) {
        body.put("output_language", normalizeOutputLanguage(body.get("output_language")));
        return ResponseEntity.ok(aiApiClient.checkCvJd(body));
    }

    @PostMapping("/check-current-cv-jd")
    public ResponseEntity<String> checkCurrentCvJd(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String jobDescription = body.get("job_description") != null
                ? body.get("job_description").toString()
                : "";

        Map<String, Object> request = new HashMap<>();
        request.put("cv_data", cvUploadService.getCvDataForAi(user));
        request.put("job_description", jobDescription);
        request.put("output_language", normalizeOutputLanguage(body.get("output_language")));

        return ResponseEntity.ok(aiApiClient.checkCvJd(request));
    }

    @PostMapping("/check-cv-jd-file")
    public ResponseEntity<String> checkCvJdFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("job_description") String jobDescription,
            @RequestParam(value = "output_language", required = false) String outputLanguage) {
        return ResponseEntity.ok(aiApiClient.checkCvJdFile(file, jobDescription, normalizeOutputLanguage(outputLanguage)));
    }

    @PostMapping("/extract-and-check")
    public ResponseEntity<String> extractAndCheck(
            @RequestParam("file") MultipartFile file,
            @RequestParam("job_description") String jobDescription,
            @RequestParam(value = "output_language", required = false) String outputLanguage) {
        return ResponseEntity.ok(aiApiClient.extractAndCheck(file, jobDescription, normalizeOutputLanguage(outputLanguage)));
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<String> generateQuestions(@RequestBody Map<String, Object> body) {
        body.put("output_language", normalizeOutputLanguage(body.get("output_language")));
        return ResponseEntity.ok(aiApiClient.generateQuestions(body));
    }

    private String normalizeOutputLanguage(Object value) {
        if (value == null) {
            return "en";
        }
        return "vi".equalsIgnoreCase(value.toString().trim()) ? "vi" : "en";
    }
}
