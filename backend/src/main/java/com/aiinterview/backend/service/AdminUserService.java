package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.AdminUserPageResponse;
import com.aiinterview.backend.dto.AdminUserResponse;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.UserSubscription;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.aiinterview.backend.entity.AdminAction;
import com.aiinterview.backend.repository.AdminActionRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final AdminActionRepository adminActionRepository;

    private void logAdminAction(String actionType, String reason, User targetUser) {
        String adminEmail = "system";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            adminEmail = auth.getName();
        }
        try {
            userRepository.findByEmail(adminEmail).ifPresent(admin -> {
                AdminAction action = AdminAction.builder()
                        .adminUser(admin)
                        .targetUser(targetUser)
                        .actionType(actionType)
                        .reason(reason)
                        .build();
                adminActionRepository.save(action);
            });
        } catch (Exception e) {
            // Ignore logging errors
        }
    }

    /**
     * Lấy danh sách user có phân trang, tìm kiếm email, lọc trạng thái
     * status: "banned" | "active" | null (all)
     * @Transactional(readOnly=true) đảm bảo lazy profile load không bị LazyInitializationException
     */
    @Transactional(readOnly = true)
    public AdminUserPageResponse getUsers(int page, int size, String email, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Boolean isBanned = null;
        if ("banned".equalsIgnoreCase(status)) isBanned = true;
        else if ("active".equalsIgnoreCase(status)) isBanned = false;

        String emailParam = (email == null || email.isBlank()) ? "" : email.trim();

        Page<User> userPage = userRepository.findAllNonAdminUsers(emailParam, isBanned, pageable);

        List<AdminUserResponse> userResponses = userPage.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return AdminUserPageResponse.builder()
                .users(userResponses)
                .page(page)
                .size(size)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .build();
    }

    /**
     * Khóa tài khoản user
     */
    @Transactional
    public AdminUserResponse banUser(UUID userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if ("ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Cannot ban admin accounts");
        }

        user.setIsBanned(true);
        user.setBanReason(reason != null ? reason : "Violated terms of service");
        userRepository.save(user);
        
        logAdminAction("BAN_USER", "Banned user: " + user.getEmail() + " | Reason: " + user.getBanReason(), user);
        return mapToResponse(user);
    }

    /**
     * Mở khóa tài khoản user
     */
    @Transactional
    public AdminUserResponse unbanUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setIsBanned(false);
        user.setBanReason(null);
        userRepository.save(user);
        
        logAdminAction("UNBAN_USER", "Unbanned user: " + user.getEmail(), user);
        return mapToResponse(user);
    }

    // ---- Helper ----

    /**
     * Chuyển User entity → DTO.
     * Phải được gọi trong @Transactional context để lazy fields (profile) hoạt động.
     */
    private AdminUserResponse mapToResponse(User user) {
        String fullName = null;
        String avatarUrl = null;
        try {
            if (user.getProfile() != null) {
                fullName = user.getProfile().getFullName();
                avatarUrl = user.getProfile().getAvatarUrl();
            }
        } catch (Exception ignored) {
            // profile chưa được load — để null
        }

        String currentPlan = "Free";
        String subscriptionStatus = null;
        try {
            Optional<UserSubscription> activeSub = userSubscriptionRepository
                    .findFirstByUserEmailAndStatusInOrderByCreatedAtDesc(
                            user.getEmail(),
                            List.of(UserSubscription.Status.ACTIVE, UserSubscription.Status.ACTIVE_NON_RENEWING)
                    );
            if (activeSub.isPresent()) {
                currentPlan = activeSub.get().getPlan().getName();
                subscriptionStatus = activeSub.get().getStatus().name();
            }
        } catch (Exception ignored) {
            // nếu không có subscription thì để Free
        }

        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(fullName)
                .avatarUrl(avatarUrl)
                .role(user.getRole())
                .isActive(user.getIsActive())
                .isBanned(user.getIsBanned())
                .banReason(user.getBanReason())
                .emailVerified(user.getEmailVerified())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .currentPlan(currentPlan)
                .subscriptionStatus(subscriptionStatus)
                .build();
    }
}
