package com.aiinterview.backend.dto;

import lombok.Data;

@Data
public class SubscriptionRequest {
    private Long planId;
    private String cycle; // "MONTHLY" or "YEARLY"
    private String promoCode;
}
