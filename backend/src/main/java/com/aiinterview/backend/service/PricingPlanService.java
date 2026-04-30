package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.PricingPlanRequest;
import com.aiinterview.backend.dto.PricingPlanResponse;
import com.aiinterview.backend.entity.AdminAction;
import com.aiinterview.backend.entity.PricingPlan;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.AdminActionRepository;
import com.aiinterview.backend.repository.PricingPlanRepository;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingPlanService {

    private final PricingPlanRepository pricingPlanRepository;
    private final AdminActionRepository adminActionRepository;
    private final UserRepository userRepository;

    public List<PricingPlanResponse> getAllActivePlans() {
        return pricingPlanRepository.findByIsActiveTrueAndDeletedAtIsNullOrderByIdAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PricingPlanResponse> getAllPlansAdmin() {
        return pricingPlanRepository.findByDeletedAtIsNullOrderByIdAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PricingPlanResponse getPlanById(Long id) {
        PricingPlan plan = pricingPlanRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException("Pricing plan not found"));
        return mapToResponse(plan);
    }

    @Transactional
    public PricingPlanResponse createPlan(PricingPlanRequest request, String adminEmail) {
        PricingPlan plan = PricingPlan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .priceMonthly(request.getPriceMonthly())
                .priceYearly(request.getPriceYearly())
                .features(request.getFeatures())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
                
        PricingPlan savedPlan = pricingPlanRepository.save(plan);
        logAdminAction(adminEmail, "CREATE_PRICING_PLAN", "Created pricing plan: " + savedPlan.getName());
        return mapToResponse(savedPlan);
    }

    @Transactional
    public PricingPlanResponse updatePlan(Long id, PricingPlanRequest request, String adminEmail) {
        PricingPlan plan = pricingPlanRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException("Pricing plan not found"));

        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setPriceMonthly(request.getPriceMonthly());
        plan.setPriceYearly(request.getPriceYearly());
        plan.setFeatures(request.getFeatures());
        if (request.getIsActive() != null) {
            plan.setIsActive(request.getIsActive());
        }

        PricingPlan savedPlan = pricingPlanRepository.save(plan);
        logAdminAction(adminEmail, "UPDATE_PRICING_PLAN", "Updated pricing plan: " + savedPlan.getName());
        return mapToResponse(savedPlan);
    }

    @Transactional
    public void deletePlan(Long id, String adminEmail) {
        PricingPlan plan = pricingPlanRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException("Pricing plan not found"));

        // TODO: check if users are currently subscribed to this plan
        // if (hasActiveUsers(id)) {
        //     throw new AppException("Cannot delete pricing plan as it has active users", HttpStatus.BAD_REQUEST);
        // }

        plan.setDeletedAt(LocalDateTime.now());
        pricingPlanRepository.save(plan);
        
        logAdminAction(adminEmail, "DELETE_PRICING_PLAN", "Deleted pricing plan: " + plan.getName());
    }

    private void logAdminAction(String adminEmail, String actionType, String reason) {
        userRepository.findByEmail(adminEmail).ifPresent(admin -> {
            AdminAction action = AdminAction.builder()
                    .adminUser(admin)
                    .actionType(actionType)
                    .reason(reason)
                    .build();
            adminActionRepository.save(action);
        });
    }

    private PricingPlanResponse mapToResponse(PricingPlan plan) {
        return PricingPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .priceMonthly(plan.getPriceMonthly())
                .priceYearly(plan.getPriceYearly())
                .features(plan.getFeatures())
                .isActive(plan.getIsActive())
                .createdAt(plan.getCreatedAt())
                .build();
    }
}
