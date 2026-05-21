package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.ExperienceLevelResponse;
import com.aiinterview.backend.service.ExperienceLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/experience-levels")
@RequiredArgsConstructor
public class ExperienceLevelController {

    private final ExperienceLevelService experienceLevelService;

    @GetMapping
    public ResponseEntity<List<ExperienceLevelResponse>> getActive() {
        return ResponseEntity.ok(experienceLevelService.getActivelevels());
    }
}
