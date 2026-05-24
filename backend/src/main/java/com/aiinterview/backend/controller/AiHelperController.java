package com.aiinterview.backend.controller;

import com.aiinterview.backend.service.AiApiClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/ai-helpers")
@RequiredArgsConstructor
public class AiHelperController {

    private final AiApiClient aiApiClient;

    @PostMapping("/check-cv-jd")
    public ResponseEntity<String> checkCvJd(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(aiApiClient.checkCvJd(body));
    }

    @PostMapping("/check-cv-jd-file")
    public ResponseEntity<String> checkCvJdFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("job_description") String jobDescription) {
        return ResponseEntity.ok(aiApiClient.checkCvJdFile(file, jobDescription));
    }

    @PostMapping("/extract-and-check")
    public ResponseEntity<String> extractAndCheck(
            @RequestParam("file") MultipartFile file,
            @RequestParam("job_description") String jobDescription) {
        return ResponseEntity.ok(aiApiClient.extractAndCheck(file, jobDescription));
    }

    @PostMapping("/generate-questions")
    public ResponseEntity<String> generateQuestions(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(aiApiClient.generateQuestions(body));
    }
}
