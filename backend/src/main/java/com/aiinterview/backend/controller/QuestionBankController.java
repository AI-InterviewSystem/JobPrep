package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.QuestionBankResponse;
import com.aiinterview.backend.dto.QuestionBankPageResponse;
import com.aiinterview.backend.dto.QuestionTopicResponse;
import com.aiinterview.backend.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/question-bank")
@RequiredArgsConstructor
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    @GetMapping
    public ResponseEntity<QuestionBankPageResponse> getQuestions(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Integer topicId,
            @RequestParam(required = false) String questionType,
            @RequestParam(required = false) Boolean bookmarked,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(questionBankService.getUserQuestions(role, level, topicId, questionType, bookmarked, keyword, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionBankResponse> getQuestionDetail(@PathVariable Integer id) {
        return ResponseEntity.ok(questionBankService.getUserQuestionDetail(id));
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<List<QuestionBankResponse>> getBookmarks() {
        return ResponseEntity.ok(questionBankService.getBookmarkedQuestions());
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<QuestionBankResponse> bookmarkQuestion(@PathVariable Integer id) {
        return ResponseEntity.ok(questionBankService.bookmarkQuestion(id));
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<Void> removeBookmark(@PathVariable Integer id) {
        questionBankService.removeBookmark(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/topics")
    public ResponseEntity<List<QuestionTopicResponse>> getTopics() {
        return ResponseEntity.ok(questionBankService.getActiveTopics());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(questionBankService.getActiveRoles());
    }
}
