package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.QuestionBankRequest;
import com.aiinterview.backend.dto.QuestionBankResponse;
import com.aiinterview.backend.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/question-bank")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionBankController {

    private final QuestionBankService questionBankService;

    @GetMapping
    public ResponseEntity<List<QuestionBankResponse>> getQuestions(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID roleId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String questionType,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(questionBankService.getQuestions(categoryId, roleId, difficulty, questionType, isActive));
    }

    @PostMapping
    public ResponseEntity<QuestionBankResponse> createQuestion(@RequestBody QuestionBankRequest request) {
        return ResponseEntity.ok(questionBankService.createQuestion(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionBankResponse> updateQuestion(@PathVariable Integer id, @RequestBody QuestionBankRequest request) {
        return ResponseEntity.ok(questionBankService.updateQuestion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Integer id) {
        questionBankService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<QuestionBankResponse> setActive(@PathVariable Integer id, @RequestBody Map<String, Boolean> request) {
        return ResponseEntity.ok(questionBankService.setActive(id, Boolean.TRUE.equals(request.get("isActive"))));
    }

    @PostMapping("/import")
    public ResponseEntity<List<QuestionBankResponse>> importQuestions(@RequestBody List<QuestionBankRequest> requests) {
        return ResponseEntity.ok(questionBankService.importQuestions(requests));
    }
}
