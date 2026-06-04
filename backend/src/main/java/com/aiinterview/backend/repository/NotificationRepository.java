package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.Notification;
import com.aiinterview.backend.entity.Notification.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(UUID userId);

    long countByUserIdAndIsReadFalseAndDeletedAtIsNull(UUID userId);

    Optional<Notification> findByIdAndUserIdAndDeletedAtIsNull(UUID id, UUID userId);

    @Query("""
            SELECT COUNT(n) > 0 FROM Notification n
            WHERE n.user.id = :userId AND n.type = :type AND n.deletedAt IS NULL
            AND n.createdAt >= :since
            """)
    boolean existsRecentByUserAndType(
            @Param("userId") UUID userId,
            @Param("type") NotificationType type,
            @Param("since") LocalDateTime since);

    @Modifying
    @Query("""
            UPDATE Notification n SET n.isRead = true
            WHERE n.user.id = :userId AND n.isRead = false AND n.deletedAt IS NULL
            """)
    int markAllRead(@Param("userId") UUID userId);
}
