package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.AdminPromoRequest;
import com.aiinterview.backend.dto.AdminPromoResponse;
import com.aiinterview.backend.entity.PromoCode;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPromoService {

    private final PromoCodeRepository promoCodeRepository;

    @Transactional(readOnly = true)
    public List<AdminPromoResponse> getAllPromos() {
        return promoCodeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminPromoResponse createPromo(AdminPromoRequest request) {
        if (promoCodeRepository.existsByCode(request.getCode())) {
            throw new AppException("Promo code already exists");
        }

        PromoCode promoCode = PromoCode.builder()
                .code(request.getCode().toUpperCase())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderAmount(request.getMinOrderAmount())
                .usageLimit(request.getUsageLimit())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .startsAt(request.getStartsAt())
                .expiresAt(request.getExpiresAt())
                .build();

        return mapToResponse(promoCodeRepository.save(promoCode));
    }

    @Transactional
    public AdminPromoResponse updatePromo(UUID id, AdminPromoRequest request) {
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new AppException("Promo code not found"));

        promoCodeRepository.findByCodeIgnoreCase(request.getCode())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException("Promo code already exists");
                    }
                });

        promoCode.setCode(request.getCode().toUpperCase());
        promoCode.setDiscountType(request.getDiscountType());
        promoCode.setDiscountValue(request.getDiscountValue());
        promoCode.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promoCode.setMinOrderAmount(request.getMinOrderAmount());
        promoCode.setUsageLimit(request.getUsageLimit());
        promoCode.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        promoCode.setStartsAt(request.getStartsAt());
        promoCode.setExpiresAt(request.getExpiresAt());

        return mapToResponse(promoCodeRepository.save(promoCode));
    }

    @Transactional
    public void deletePromo(UUID id) {
        if (!promoCodeRepository.existsById(id)) {
            throw new AppException("Promo code not found");
        }
        promoCodeRepository.deleteById(id);
    }

    private AdminPromoResponse mapToResponse(PromoCode promoCode) {
        return AdminPromoResponse.builder()
                .id(promoCode.getId())
                .code(promoCode.getCode())
                .discountType(promoCode.getDiscountType())
                .discountValue(promoCode.getDiscountValue())
                .maxDiscountAmount(promoCode.getMaxDiscountAmount())
                .minOrderAmount(promoCode.getMinOrderAmount())
                .usageLimit(promoCode.getUsageLimit())
                .usedCount(promoCode.getUsedCount())
                .isActive(promoCode.getIsActive())
                .startsAt(promoCode.getStartsAt())
                .expiresAt(promoCode.getExpiresAt())
                .createdAt(promoCode.getCreatedAt())
                .build();
    }
}
