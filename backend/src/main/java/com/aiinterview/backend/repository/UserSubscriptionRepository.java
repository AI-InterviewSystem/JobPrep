package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, UUID> {
}
