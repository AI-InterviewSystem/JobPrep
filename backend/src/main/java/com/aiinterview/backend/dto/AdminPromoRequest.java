package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.PromoCode.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AdminPromoRequest {
    @NotBlank(message = "Promo code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountAmount;
    private BigDecimal minOrderAmount;
    private Integer usageLimit;
    private Boolean isActive;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;
}
