package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.PricingPlanResponse;
import com.aiinterview.backend.service.PricingPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pricing-plans")
@RequiredArgsConstructor
public class PublicPricingPlanController {

    private final PricingPlanService pricingPlanService;

    @GetMapping
    public ResponseEntity<List<PricingPlanResponse>> getActivePlans() {
        return ResponseEntity.ok(pricingPlanService.getAllActivePlans());
    }
}
