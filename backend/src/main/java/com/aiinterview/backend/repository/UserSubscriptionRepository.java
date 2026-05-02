package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, UUID> {
    Optional<UserSubscription> findFirstByUserEmailAndStatusOrderByCreatedAtDesc(String email, UserSubscription.Status status);
    Optional<UserSubscription> findFirstByUserEmailAndStatusInOrderByCreatedAtDesc(String email, List<UserSubscription.Status> statuses);
    List<UserSubscription> findByUserAndStatus(User user, UserSubscription.Status status);
}
