package com.aiinterview.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PricingPlanResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal priceMonthly;
    private BigDecimal priceYearly;
    private String features;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
