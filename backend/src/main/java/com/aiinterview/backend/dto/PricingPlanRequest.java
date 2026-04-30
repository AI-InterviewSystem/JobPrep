package com.aiinterview.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PricingPlanRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Monthly price is required")
    private BigDecimal priceMonthly;
    
    @NotNull(message = "Yearly price is required")
    private BigDecimal priceYearly;
    
    private String features; // JSON string
    
    private Boolean isActive = true;
}
