package com.aiinterview.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.aiinterview.backend.dto.PaymentResponse;
import com.aiinterview.backend.dto.SubscriptionRequest;
import com.aiinterview.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/subscribe")
    public ResponseEntity<PaymentResponse> subscribe(@RequestBody SubscriptionRequest request) throws Exception {
        return ResponseEntity.ok(paymentService.createSubscriptionPayment(request.getPlanId()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody JsonNode webhook) {
        paymentService.handlePaymentWebhook(webhook);
        return ResponseEntity.ok().build();
    }
}
