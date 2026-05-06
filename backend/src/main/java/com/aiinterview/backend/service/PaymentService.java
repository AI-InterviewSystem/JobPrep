package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.entity.*;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PayOS payOS;
    private final UserSubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PricingPlanRepository pricingPlanRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final PromoCodeUsageRepository promoCodeUsageRepository;
    private final PromoCodeService promoCodeService;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${payos.exchange-rate-usd-vnd:26000}")
    private long exchangeRate;

    @Transactional
    public PaymentResponse createSubscriptionPayment(SubscriptionRequest subscriptionRequest) throws Exception {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found"));

        PricingPlan plan = pricingPlanRepository.findById(subscriptionRequest.getPlanId())
                .orElseThrow(() -> new AppException("Plan not found"));

        if (!plan.getIsActive() || plan.getDeletedAt() != null) {
            throw new AppException("This plan is no longer available");
        }

        String cycleStr = subscriptionRequest.getCycle() != null ? subscriptionRequest.getCycle() : "MONTHLY";
        UserSubscription.BillingCycle cycle = UserSubscription.BillingCycle.valueOf(cycleStr.toUpperCase());

        // Check for existing active subscription
        UserSubscription activeSub = subscriptionRepository.findFirstByUserEmailAndStatusOrderByCreatedAtDesc(email, UserSubscription.Status.ACTIVE)
                .orElse(null);

        BigDecimal finalAmountUsd;
        Payment.Type paymentType;

        if (activeSub != null) {
            // Upgrade Flow
            paymentType = Payment.Type.UPGRADE;
            
            // Calculate Proration
            LocalDateTime now = LocalDateTime.now();
            long daysLeft = 0;
            if (activeSub.getCurrentPeriodEnd() != null) {
                daysLeft = java.time.temporal.ChronoUnit.DAYS.between(now, activeSub.getCurrentPeriodEnd());
            }
            if (daysLeft < 0) daysLeft = 0;

            BigDecimal oldPriceMonthly = activeSub.getPlan().getPriceMonthly();
            BigDecimal remainingValue = oldPriceMonthly.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(daysLeft));

            BigDecimal newPrice = (cycle == UserSubscription.BillingCycle.YEARLY) ? plan.getPriceYearly() : plan.getPriceMonthly();
            finalAmountUsd = newPrice.subtract(remainingValue);
            
            if (finalAmountUsd.compareTo(BigDecimal.ZERO) < 0) {
                finalAmountUsd = BigDecimal.ZERO;
            }
        } else {
            // New Subscription Flow
            paymentType = Payment.Type.NEW_SUBSCRIPTION;
            finalAmountUsd = (cycle == UserSubscription.BillingCycle.YEARLY) ? plan.getPriceYearly() : plan.getPriceMonthly();
        }

        // Apply Promo Code if present
        PromoCode promoCode = null;
        if (subscriptionRequest.getPromoCode() != null && !subscriptionRequest.getPromoCode().isEmpty()) {
            PromoCodeRequest promoRequest = new PromoCodeRequest();
            promoRequest.setCode(subscriptionRequest.getPromoCode());
            promoRequest.setPlanId(subscriptionRequest.getPlanId());
            promoRequest.setCycle(cycleStr);
            
            PromoCodeResponse promoResponse = promoCodeService.validateAndCalculate(promoRequest, user);
            if (promoResponse.isValid()) {
                finalAmountUsd = promoResponse.getFinalAmount();
                promoCode = promoCodeRepository.findByCodeIgnoreCase(subscriptionRequest.getPromoCode()).orElse(null);
            }
        }

        // 1. Create Pending Subscription
        UserSubscription subscription = UserSubscription.builder()
                .user(user)
                .plan(plan)
                .status(UserSubscription.Status.PENDING)
                .billingCycle(cycle)
                .build();
        subscription = subscriptionRepository.save(subscription);

        // Calculate amount in VND
        BigDecimal amountVnd = finalAmountUsd.multiply(BigDecimal.valueOf(exchangeRate));
        long finalAmountVnd = amountVnd.setScale(0, RoundingMode.HALF_UP).longValue();
        
        // PayOS requires amount > 2000 VND. If it's 0 (full credit), we might need a different flow, 
        // but for now let's assume it's at least some amount or handle 0.
        if (finalAmountVnd < 2000 && finalAmountVnd > 0) {
            finalAmountVnd = 2000; // Minimum amount for PayOS
        }

        // 2. Create Payment Record
        long orderCode = System.currentTimeMillis();
        Payment payment = Payment.builder()
                .user(user)
                .subscription(subscription)
                .amount(BigDecimal.valueOf(finalAmountVnd))
                .currency("VND")
                .provider("PayOS")
                .transactionId(String.valueOf(orderCode))
                .status(Payment.Status.PENDING)
                .type(paymentType)
                .promoCode(promoCode)
                .build();
        payment = paymentRepository.save(payment);

        // If amount is 0, we could theoretically skip PayOS and activate immediately.
        // But for simplicity in this flow, let's assume the user still goes through the link or we handle it.
        // Actually, PayOS might fail with 0. 
        if (finalAmountVnd == 0) {
            // Handle zero payment activation immediately?
            // For now, let's proceed and see.
        }

        // 3. Create PayOS Payment Link
        String description = (paymentType == Payment.Type.UPGRADE ? "Upgrade " : "Subscribe ") + plan.getName();
        if (description.length() > 25) {
            description = description.substring(0, 25);
        }
        String returnUrl = frontendUrl + "/payment/success";
        String cancelUrl = frontendUrl + "/payment/cancel";

        PaymentLinkItem item = new PaymentLinkItem();
        item.setName(plan.getName());
        item.setQuantity(1);
        item.setPrice(finalAmountVnd);

        List<PaymentLinkItem> items = new ArrayList<>();
        items.add(item);

        CreatePaymentLinkRequest request = new CreatePaymentLinkRequest();
        request.setOrderCode(orderCode);
        request.setAmount(finalAmountVnd);
        request.setDescription(description);
        request.setItems(items);
        request.setCancelUrl(cancelUrl);
        request.setReturnUrl(returnUrl);

        CreatePaymentLinkResponse checkoutResponse = payOS.paymentRequests().create(request);

        return PaymentResponse.builder()
                .checkoutUrl(checkoutResponse.getCheckoutUrl())
                .paymentId(checkoutResponse.getPaymentLinkId())
                .build();
    }

    @Transactional
    public void handlePaymentWebhook(JsonNode webhookData) {
        JsonNode data = webhookData.get("data");
        if (data == null)
            return;

        long orderCode = data.get("orderCode").asLong();
        String status = data.get("status").asText();

        Payment payment = paymentRepository.findByTransactionId(String.valueOf(orderCode))
                .orElseThrow(() -> new AppException("Payment not found"));

        if (payment.getStatus() != Payment.Status.PENDING) {
            return; // Already processed
        }

        if ("PAID".equals(status)) {
            payment.setStatus(Payment.Status.PAID);
            payment.setPaidAt(LocalDateTime.now());
            activateSubscription(payment);
        } else if ("CANCELLED".equals(status)) {
            payment.setStatus(Payment.Status.CANCELLED);
            UserSubscription subscription = payment.getSubscription();
            if (subscription != null) {
                subscription.setStatus(UserSubscription.Status.CANCELLED);
                subscriptionRepository.save(subscription);
            }
        } else {
            payment.setStatus(Payment.Status.FAILED);
            UserSubscription subscription = payment.getSubscription();
            if (subscription != null) {
                subscription.setStatus(UserSubscription.Status.CANCELLED);
                subscriptionRepository.save(subscription);
            }
        }
        paymentRepository.save(payment);
    }

    private void activateSubscription(Payment payment) {
        UserSubscription subscription = payment.getSubscription();
        if (subscription == null) return;

        User user = payment.getUser();

        // 1. If Upgrade, close old active subscriptions
        if (payment.getType() == Payment.Type.UPGRADE) {
            List<UserSubscription> activeSubs = subscriptionRepository.findByUserAndStatus(user, UserSubscription.Status.ACTIVE);
            for (UserSubscription oldSub : activeSubs) {
                oldSub.setStatus(UserSubscription.Status.EXPIRED);
                subscriptionRepository.save(oldSub);
            }
        }

        // 2. Set Dates
        LocalDateTime now = LocalDateTime.now();
        subscription.setStatus(UserSubscription.Status.ACTIVE);
        subscription.setCurrentPeriodStart(now);
        
        if (subscription.getBillingCycle() == UserSubscription.BillingCycle.YEARLY) {
            subscription.setCurrentPeriodEnd(now.plusDays(365));
        } else {
            subscription.setCurrentPeriodEnd(now.plusDays(30));
        }

        // 3. Set AI Quota (Reset/Cấp định mức AI)
        // Try to parse from features JSON
        int interviews = 10; // Default
        try {
            JsonNode features = objectMapper.readTree(subscription.getPlan().getFeatures());
            if (features.has("interviews")) {
                interviews = features.get("interviews").asInt();
            }
        } catch (Exception e) {
            // Log error or ignore
        }
        subscription.setRemainingInterviews(interviews);
        
        // 4. Set Auto Renew
        subscription.setCancelAtPeriodEnd(false);

        subscriptionRepository.save(subscription);

        // 5. Handle Promo Code Usage
        if (payment.getPromoCode() != null) {
            PromoCode promo = payment.getPromoCode();
            
            // Record usage
            PromoCodeUsage usage = PromoCodeUsage.builder()
                    .promoCode(promo)
                    .user(user)
                    .payment(payment)
                    .build();
            promoCodeUsageRepository.save(usage);
            
            // Increment count
            promo.setUsedCount(promo.getUsedCount() + 1);
            promoCodeRepository.save(promo);
        }
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return paymentRepository.findByUserEmailOrderByCreatedAtDesc(email).stream()
                .map(payment -> TransactionResponse.builder()
                        .id(payment.getTransactionId())
                        .date(payment.getCreatedAt())
                        .amount(payment.getAmount())
                        .currency(payment.getCurrency())
                        .status(payment.getStatus().name())
                        .planName(payment.getSubscription() != null ? payment.getSubscription().getPlan().getName() : "N/A")
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void cancelSubscription() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserSubscription subscription = subscriptionRepository.findFirstByUserEmailAndStatusOrderByCreatedAtDesc(email, UserSubscription.Status.ACTIVE)
                .orElseThrow(() -> new AppException("No active subscription found"));

        subscription.setCancelAtPeriodEnd(true);
        subscription.setStatus(UserSubscription.Status.ACTIVE_NON_RENEWING);
        subscriptionRepository.save(subscription);
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusResponse getCurrentSubscription() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        LocalDateTime now = LocalDateTime.now();
        return subscriptionRepository.findFirstByUserEmailAndStatusInOrderByCreatedAtDesc(
                        email, List.of(UserSubscription.Status.ACTIVE, UserSubscription.Status.ACTIVE_NON_RENEWING))
                .filter(sub -> sub.getCurrentPeriodEnd() == null || sub.getCurrentPeriodEnd().isAfter(now))
                .map(sub -> SubscriptionStatusResponse.builder()
                        .planName(sub.getPlan().getName())
                        .status(sub.getStatus().name())
                        .currentPeriodEnd(sub.getCurrentPeriodEnd())
                        .cancelAtPeriodEnd(sub.getCancelAtPeriodEnd())
                        .remainingInterviews(sub.getRemainingInterviews())
                        .build())
                .orElse(null);
    }

    @Transactional
    public void syncPaymentStatus(long orderCode) throws Exception {
        Object infoObj = payOS.paymentRequests().get(orderCode);
        JsonNode info = objectMapper.valueToTree(infoObj);
        String status = info.get("status").asText();

        Payment payment = paymentRepository.findByTransactionId(String.valueOf(orderCode))
                .orElseThrow(() -> new AppException("Payment not found"));

        if (payment.getStatus() != Payment.Status.PENDING) {
            return; // Already processed
        }

        if ("PAID".equals(status)) {
            payment.setStatus(Payment.Status.PAID);
            payment.setPaidAt(LocalDateTime.now());
            activateSubscription(payment);
        } else if ("CANCELLED".equals(status)) {
            payment.setStatus(Payment.Status.CANCELLED);
            UserSubscription subscription = payment.getSubscription();
            if (subscription != null) {
                subscription.setStatus(UserSubscription.Status.CANCELLED);
                subscriptionRepository.save(subscription);
            }
        } else if ("EXPIRED".equals(status)) {
            payment.setStatus(Payment.Status.FAILED);
            UserSubscription subscription = payment.getSubscription();
            if (subscription != null) {
                subscription.setStatus(UserSubscription.Status.CANCELLED);
                subscriptionRepository.save(subscription);
            }
        }
        paymentRepository.save(payment);
    }
}
