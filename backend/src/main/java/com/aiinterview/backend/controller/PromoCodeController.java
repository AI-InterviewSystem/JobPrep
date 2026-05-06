package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.PromoCodeRequest;
import com.aiinterview.backend.dto.PromoCodeResponse;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.service.PromoCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/promo")
@RequiredArgsConstructor
public class PromoCodeController {

    private final PromoCodeService promoCodeService;
    private final UserRepository userRepository;

    @PostMapping("/validate")
    public ResponseEntity<PromoCodeResponse> validatePromoCode(@RequestBody PromoCodeRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(promoCodeService.validateAndCalculate(request, user));
    }
}
