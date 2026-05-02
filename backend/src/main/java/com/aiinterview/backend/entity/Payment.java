package com.aiinterview.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Payment {

    public enum Status {
        PENDING,
        PAID,
        CANCELLED,
        FAILED
    }

    public enum Type {
        NEW_SUBSCRIPTION,
        UPGRADE,
        RENEWAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subscription_id")
    private UserSubscription subscription;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 10)
    private String currency;

    @Column(length = 50)
    private String provider;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "provider_payload", columnDefinition = "jsonb")
    private String providerPayload;

    @Column(name = "transaction_id", unique = true)
    private String transactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Type type;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
