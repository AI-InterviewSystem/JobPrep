package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.PromoCode;
import com.aiinterview.backend.entity.PromoCodeUsage;
import com.aiinterview.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PromoCodeUsageRepository extends JpaRepository<PromoCodeUsage, UUID> {
    boolean existsByPromoCodeAndUser(PromoCode promoCode, User user);
}
