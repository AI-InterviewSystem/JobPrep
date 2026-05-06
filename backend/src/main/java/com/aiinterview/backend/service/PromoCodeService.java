package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.PromoCodeRequest;
import com.aiinterview.backend.dto.PromoCodeResponse;
import com.aiinterview.backend.entity.PricingPlan;
import com.aiinterview.backend.entity.PromoCode;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.PricingPlanRepository;
import com.aiinterview.backend.repository.PromoCodeRepository;
import com.aiinterview.backend.repository.PromoCodeUsageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PromoCodeService {

    private final PromoCodeRepository promoCodeRepository;
    private final PromoCodeUsageRepository promoCodeUsageRepository;
    private final PricingPlanRepository pricingPlanRepository;

    public PromoCodeResponse validateAndCalculate(PromoCodeRequest request, User user) {
        PromoCode promo = promoCodeRepository.findByCodeIgnoreCase(request.getCode())
                .orElseThrow(() -> new AppException("Promo code not found"));

        // 1. Basic checks
        if (!promo.getIsActive()) {
            throw new AppException("This promo code is no longer active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartsAt() != null && now.isBefore(promo.getStartsAt())) {
            throw new AppException("This promo code has not started yet");
        }
        if (promo.getExpiresAt() != null && now.isAfter(promo.getExpiresAt())) {
            throw new AppException("This promo code has expired");
        }

        // 2. Usage limit
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new AppException("This promo code has reached its usage limit");
        }

        // 3. User already used
        if (promoCodeUsageRepository.existsByPromoCodeAndUser(promo, user)) {
            throw new AppException("You have already used this promo code");
        }

        // 4. Get original amount
        PricingPlan plan = pricingPlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new AppException("Plan not found"));
        
        BigDecimal originalAmount = "YEARLY".equalsIgnoreCase(request.getCycle()) 
                ? plan.getPriceYearly() 
                : plan.getPriceMonthly();

        // 5. Min order amount
        if (promo.getMinOrderAmount() != null && originalAmount.compareTo(promo.getMinOrderAmount()) < 0) {
            throw new AppException("Order amount must be at least $" + promo.getMinOrderAmount() + " to use this code");
        }

        // 6. Calculate discount
        BigDecimal discountAmount = calculateDiscount(promo, originalAmount);
        BigDecimal finalAmount = originalAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;

        return PromoCodeResponse.builder()
                .valid(true)
                .message("Promo code applied successfully")
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .discountType(promo.getDiscountType().name())
                .discountValue(promo.getDiscountValue())
                .build();
    }

    public BigDecimal calculateDiscount(PromoCode promo, BigDecimal amount) {
        if (promo.getDiscountType() == PromoCode.DiscountType.FIXED) {
            return promo.getDiscountValue();
        } else {
            // Percent
            BigDecimal discount = amount.multiply(promo.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            
            if (promo.getMaxDiscountAmount() != null && discount.compareTo(promo.getMaxDiscountAmount()) > 0) {
                discount = promo.getMaxDiscountAmount();
            }
            return discount;
        }
    }
}
