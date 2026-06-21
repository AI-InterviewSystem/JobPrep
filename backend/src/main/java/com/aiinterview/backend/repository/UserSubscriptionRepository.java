package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.UserSubscription;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, UUID> {
    Optional<UserSubscription> findFirstByUserEmailAndStatusOrderByCreatedAtDesc(String email, UserSubscription.Status status);
    Optional<UserSubscription> findFirstByUserEmailAndStatusInOrderByCreatedAtDesc(String email, List<UserSubscription.Status> statuses);
    List<UserSubscription> findByUserAndStatus(User user, UserSubscription.Status status);

    @Query("""
            SELECT s FROM UserSubscription s
            JOIN FETCH s.plan
            WHERE s.user.email = :email
              AND s.status IN :statuses
              AND (s.currentPeriodEnd IS NULL OR s.currentPeriodEnd > :now)
            ORDER BY s.createdAt DESC
            """)
    List<UserSubscription> findCurrentActiveByUserEmail(
            @Param("email") String email,
            @Param("statuses") List<UserSubscription.Status> statuses,
            @Param("now") LocalDateTime now,
            Pageable pageable);
}
