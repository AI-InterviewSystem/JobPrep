package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.AdminPromoRequest;
import com.aiinterview.backend.dto.AdminPromoResponse;
import com.aiinterview.backend.service.AdminPromoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/promos")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPromoController {

    private final AdminPromoService promoService;

    @GetMapping
    public ResponseEntity<List<AdminPromoResponse>> getAllPromos() {
        return ResponseEntity.ok(promoService.getAllPromos());
    }

    @PostMapping
    public ResponseEntity<AdminPromoResponse> createPromo(@Valid @RequestBody AdminPromoRequest request) {
        return ResponseEntity.ok(promoService.createPromo(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminPromoResponse> updatePromo(
            @PathVariable UUID id,
            @Valid @RequestBody AdminPromoRequest request) {
        return ResponseEntity.ok(promoService.updatePromo(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromo(@PathVariable UUID id) {
        promoService.deletePromo(id);
        return ResponseEntity.ok().build();
    }
}
