package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.PricingPlanRequest;
import com.aiinterview.backend.dto.PricingPlanResponse;
import com.aiinterview.backend.service.PricingPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/pricing-plans")
@RequiredArgsConstructor
public class AdminPricingPlanController {

    private final PricingPlanService pricingPlanService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PricingPlanResponse>> getAllPlans() {
        return ResponseEntity.ok(pricingPlanService.getAllPlansAdmin());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingPlanResponse> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(pricingPlanService.getPlanById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingPlanResponse> createPlan(
            @Valid @RequestBody PricingPlanRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(pricingPlanService.createPlan(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PricingPlanResponse> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody PricingPlanRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(pricingPlanService.updatePlan(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id, Authentication authentication) {
        pricingPlanService.deletePlan(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
