package com.aiinterview.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/subscribe")
    public ResponseEntity<PaymentResponse> subscribe(@RequestBody SubscriptionRequest request) throws Exception {
        return ResponseEntity.ok(paymentService.createSubscriptionPayment(request));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody JsonNode webhook) {
        paymentService.handlePaymentWebhook(webhook);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<TransactionResponse>> getHistory() {
        return ResponseEntity.ok(paymentService.getTransactionHistory());
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelSubscription() {
        paymentService.cancelSubscription();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/current")
    public ResponseEntity<SubscriptionStatusResponse> getCurrentSubscription() {
        return ResponseEntity.ok(paymentService.getCurrentSubscription());
    }

    @GetMapping("/sync/{orderCode}")
    public ResponseEntity<Void> syncStatus(@PathVariable long orderCode) throws Exception {
        paymentService.syncPaymentStatus(orderCode);
        return ResponseEntity.ok().build();
    }
}
