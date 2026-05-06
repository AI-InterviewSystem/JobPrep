package com.aiinterview.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PromoCodeRequest {
    private String code;
    private Long planId;
    private String cycle; // MONTHLY, YEARLY
}
