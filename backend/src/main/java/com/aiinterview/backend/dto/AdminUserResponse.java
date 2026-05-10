package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private Boolean isActive;
    private Boolean isBanned;
    private String banReason;
    private Boolean emailVerified;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

    // Subscription info
    private String currentPlan;       // plan name or "Free"
    private String subscriptionStatus; // ACTIVE, EXPIRED, etc. or null
}
