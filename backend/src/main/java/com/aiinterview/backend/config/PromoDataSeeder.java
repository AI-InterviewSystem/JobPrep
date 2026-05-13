package com.aiinterview.backend.config;

import com.aiinterview.backend.entity.PromoCode;
import com.aiinterview.backend.entity.PromoCode.DiscountType;
import com.aiinterview.backend.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class PromoDataSeeder {

    private final PromoCodeRepository promoCodeRepository;

    @Bean
    CommandLineRunner seedPromos() {
        return args -> {
            if (promoCodeRepository.count() > 0) {
                log.info("Promo codes already seeded. Skipping...");
                return;
            }

            log.info("Seeding initial sample promo codes...");

            List<PromoCode> samplePromos = List.of(
                PromoCode.builder()
                        .code("WELCOME10")
                        .discountType(DiscountType.PERCENT)
                        .discountValue(new BigDecimal("10"))
                        .usageLimit(1000)
                        .isActive(true)
                        .startsAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusMonths(6))
                        .build(),
                PromoCode.builder()
                        .code("SUMMER50")
                        .discountType(DiscountType.PERCENT)
                        .discountValue(new BigDecimal("50"))
                        .maxDiscountAmount(new BigDecimal("50"))
                        .minOrderAmount(new BigDecimal("20"))
                        .usageLimit(100)
                        .isActive(true)
                        .startsAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusMonths(3))
                        .build(),
                PromoCode.builder()
                        .code("SAVE20")
                        .discountType(DiscountType.FIXED)
                        .discountValue(new BigDecimal("20"))
                        .minOrderAmount(new BigDecimal("50"))
                        .usageLimit(50)
                        .isActive(true)
                        .startsAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusMonths(1))
                        .build(),
                PromoCode.builder()
                        .code("STUDENT70")
                        .discountType(DiscountType.PERCENT)
                        .discountValue(new BigDecimal("70"))
                        .usageLimit(500)
                        .isActive(true)
                        .startsAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusYears(1))
                        .build(),
                PromoCode.builder()
                        .code("VIP100")
                        .discountType(DiscountType.FIXED)
                        .discountValue(new BigDecimal("100"))
                        .minOrderAmount(new BigDecimal("200"))
                        .usageLimit(10)
                        .isActive(true)
                        .startsAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusMonths(12))
                        .build()
            );

            promoCodeRepository.saveAll(samplePromos);
            log.info("Successfully seeded 5 sample promo codes.");
        };
    }
}
