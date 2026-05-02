package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.PaymentResponse;
import com.aiinterview.backend.entity.*;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.PaymentRepository;
import com.aiinterview.backend.repository.PricingPlanRepository;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.repository.UserSubscriptionRepository;
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
    private final ObjectMapper objectMapper;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${payos.exchange-rate-usd-vnd:26000}")
    private long exchangeRate;

    @Transactional
    public PaymentResponse createSubscriptionPayment(Long planId) throws Exception {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found"));

        PricingPlan plan = pricingPlanRepository.findById(planId)
                .orElseThrow(() -> new AppException("Plan not found"));

        if (!plan.getIsActive() || plan.getDeletedAt() != null) {
            throw new AppException("This plan is no longer available");
        }

        // 1. Create Pending Subscription
        UserSubscription subscription = UserSubscription.builder()
                .user(user)
                .plan(plan)
                .status(UserSubscription.Status.PENDING)
                .build();
        subscription = subscriptionRepository.save(subscription);

        // Calculate amount in VND
        BigDecimal priceUsd = plan.getPriceMonthly();
        BigDecimal amountVnd = priceUsd.multiply(BigDecimal.valueOf(exchangeRate));
        long finalAmountVnd = amountVnd.setScale(0, RoundingMode.HALF_UP).longValue();

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
                .build();
        payment = paymentRepository.save(payment);

        // 3. Create PayOS Payment Link
        String description = "Thanh toan " + plan.getName();
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
        // PayOS Webhook logic
        JsonNode data = webhookData.get("data");
        if (data == null)
            return;

        long orderCode = data.get("orderCode").asLong();
        String code = webhookData.get("code").asText();

        Payment payment = paymentRepository.findByTransactionId(String.valueOf(orderCode))
                .orElseThrow(() -> new AppException("Payment not found"));

        if (payment.getStatus() != Payment.Status.PENDING) {
            return; // Already processed
        }

        if ("00".equals(code)) {
            // Success
            payment.setStatus(Payment.Status.PAID);
            payment.setPaidAt(LocalDateTime.now());

            UserSubscription subscription = payment.getSubscription();
            subscription.setStatus(UserSubscription.Status.ACTIVE);
            subscription.setCurrentPeriodStart(LocalDateTime.now());
            subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));

            subscriptionRepository.save(subscription);
        } else {
            // Failed or Cancelled
            payment.setStatus(Payment.Status.FAILED);
            UserSubscription subscription = payment.getSubscription();
            subscription.setStatus(UserSubscription.Status.CANCELLED);
            subscriptionRepository.save(subscription);
        }

        paymentRepository.save(payment);
    }
}
