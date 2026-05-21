package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.ExperienceLevelRequest;
import com.aiinterview.backend.dto.ExperienceLevelResponse;
import com.aiinterview.backend.service.ExperienceLevelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/experience-levels")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminExperienceLevelController {

    private final ExperienceLevelService experienceLevelService;

    @GetMapping
    public ResponseEntity<List<ExperienceLevelResponse>> getAll() {
        return ResponseEntity.ok(experienceLevelService.getAllLevels());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperienceLevelResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(experienceLevelService.getLevelById(id));
    }

    @PostMapping
    public ResponseEntity<ExperienceLevelResponse> create(@RequestBody ExperienceLevelRequest request) {
        return ResponseEntity.ok(experienceLevelService.createLevel(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExperienceLevelResponse> update(
            @PathVariable Integer id,
            @RequestBody ExperienceLevelRequest request) {
        return ResponseEntity.ok(experienceLevelService.updateLevel(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        experienceLevelService.deleteLevel(id);
        return ResponseEntity.ok().build();
    }
}
