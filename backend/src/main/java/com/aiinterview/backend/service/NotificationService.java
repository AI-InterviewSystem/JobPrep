package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.NotificationPreferenceRequest;
import com.aiinterview.backend.dto.NotificationPreferenceResponse;
import com.aiinterview.backend.dto.NotificationResponse;
import com.aiinterview.backend.entity.Notification;
import com.aiinterview.backend.entity.Notification.NotificationType;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.UserLearningStats;
import com.aiinterview.backend.entity.UserSubscription;
import com.aiinterview.backend.entity.InterviewSession;
import com.aiinterview.backend.entity.InterviewSession.InterviewStatus;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.InterviewSessionRepository;
import com.aiinterview.backend.repository.NotificationRepository;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserLearningStatsService learningStatsService;
    private final UserSubscriptionRepository subscriptionRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional(readOnly = true)
    public List<NotificationResponse> listNotifications() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId())
                .stream().map(this::map).toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByUserIdAndIsReadFalseAndDeletedAtIsNull(getCurrentUser().getId());
    }

    @Transactional(readOnly = true)
    public NotificationResponse getNotification(UUID id) {
        Notification n = notificationRepository.findByIdAndUserIdAndDeletedAtIsNull(id, getCurrentUser().getId())
                .orElseThrow(() -> new AppException("Notification not found"));
        return map(n);
    }

    @Transactional
    public NotificationResponse markRead(UUID id) {
        Notification n = notificationRepository.findByIdAndUserIdAndDeletedAtIsNull(id, getCurrentUser().getId())
                .orElseThrow(() -> new AppException("Notification not found"));
        n.setIsRead(true);
        return map(notificationRepository.save(n));
    }

    @Transactional
    public void markAllRead() {
        notificationRepository.markAllRead(getCurrentUser().getId());
    }

    @Transactional
    public void deleteNotification(UUID id) {
        Notification n = notificationRepository.findByIdAndUserIdAndDeletedAtIsNull(id, getCurrentUser().getId())
                .orElseThrow(() -> new AppException("Notification not found"));
        n.setDeletedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getPreferences() {
        UserLearningStats stats = learningStatsService.getOrCreate(getCurrentUser());
        return NotificationPreferenceResponse.builder()
                .practiceReminders(Boolean.TRUE.equals(stats.getPracticeReminders()))
                .subscriptionAlerts(Boolean.TRUE.equals(stats.getSubscriptionAlerts()))
                .learningSuggestions(Boolean.TRUE.equals(stats.getLearningSuggestions()))
                .build();
    }

    @Transactional
    public NotificationPreferenceResponse updatePreferences(NotificationPreferenceRequest request) {
        UserLearningStats stats = learningStatsService.savePreferences(
                getCurrentUser(),
                request.getPracticeReminders(),
                request.getSubscriptionAlerts(),
                request.getLearningSuggestions());
        return NotificationPreferenceResponse.builder()
                .practiceReminders(Boolean.TRUE.equals(stats.getPracticeReminders()))
                .subscriptionAlerts(Boolean.TRUE.equals(stats.getSubscriptionAlerts()))
                .learningSuggestions(Boolean.TRUE.equals(stats.getLearningSuggestions()))
                .build();
    }

    @Transactional
    public void syncSystemNotifications(User user) {
        UserLearningStats prefs = learningStatsService.getOrCreate(user);
        if (Boolean.TRUE.equals(prefs.getPracticeReminders())) {
            maybeCreatePracticeReminder(user, prefs);
        }
        if (Boolean.TRUE.equals(prefs.getSubscriptionAlerts())) {
            maybeCreateSubscriptionAlerts(user);
        }
        if (Boolean.TRUE.equals(prefs.getLearningSuggestions())) {
            maybeCreateWeakTopicSuggestion(user);
            maybeCreateRetryInterviewSuggestion(user);
        }
    }

    private void maybeCreatePracticeReminder(User user, UserLearningStats stats) {
        if (stats.getLastActivityDate() == null)
            return;
        long daysSince = ChronoUnit.DAYS.between(stats.getLastActivityDate(), LocalDate.now());
        if (daysSince < 2)
            return;
        if (notificationRepository.existsRecentByUserAndType(user.getId(), NotificationType.PRACTICE_REMINDER,
                LocalDateTime.now().minusDays(1))) {
            return;
        }
        create(user, NotificationType.PRACTICE_REMINDER,
                "Nhắc luyện tập",
                "Bạn đã không luyện tập " + daysSince
                        + " ngày. Hãy duy trì thói quen với Mock Interview hoặc Question Bank.",
                frontendUrl + "/interview-setup",
                "Bắt đầu luyện",
                null);
    }

    private void maybeCreateSubscriptionAlerts(User user) {
        subscriptionRepository.findFirstByUserEmailAndStatusInOrderByCreatedAtDesc(
                user.getEmail(),
                List.of(UserSubscription.Status.ACTIVE, UserSubscription.Status.ACTIVE_NON_RENEWING))
                .ifPresent(sub -> {
                    if (sub.getCurrentPeriodEnd() == null)
                        return;
                    long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), sub.getCurrentPeriodEnd().toLocalDate());
                    if (daysLeft < 0 || daysLeft > 7)
                        return; // Trigger for 0-7 days left
                    if (notificationRepository.existsRecentByUserAndType(
                            user.getId(), NotificationType.SUBSCRIPTION_EXPIRING, LocalDateTime.now().minusDays(1))) {
                        return;
                    }
                    create(user, NotificationType.SUBSCRIPTION_EXPIRING,
                            "Gói subscription sắp hết hạn",
                            "Gói của bạn sẽ hết hạn sau " + daysLeft
                                    + " ngày. Gia hạn để tiếp tục sử dụng đầy đủ tính năng.",
                            frontendUrl + "/pricing",
                            "Xem gói",
                            Map.of("daysLeft", daysLeft));
                });
    }

    private void maybeCreateWeakTopicSuggestion(User user) {
        List<Map<String, Object>> weak = jdbcTemplate.queryForList("""
                SELECT m.topic_id, t.name, m.avg_score
                FROM user_topic_metrics m
                JOIN question_topics t ON t.id = m.topic_id
                WHERE m.user_id = ? AND m.total_practiced >= 2
                ORDER BY m.avg_score ASC NULLS LAST
                LIMIT 1
                """, user.getId());
        if (weak.isEmpty())
            return;
        Integer topicId = (Integer) weak.get(0).get("topic_id");
        String topicName = (String) weak.get(0).get("name");
        if (notificationRepository.existsRecentByUserAndType(
                user.getId(), NotificationType.WEAK_TOPIC_SUGGESTION, LocalDateTime.now().minusDays(3))) {
            return;
        }
        create(user, NotificationType.WEAK_TOPIC_SUGGESTION,
                "Gợi ý luyện topic yếu",
                "Điểm trung bình " + topicName + " đang thấp. Hãy luyện thêm trong Question Bank.",
                frontendUrl + "/question-bank?topicId=" + topicId,
                "Luyện ngay",
                Map.of("topicId", topicId, "topicName", topicName));
    }

    private void maybeCreateRetryInterviewSuggestion(User user) {
        List<InterviewSession> sessions = interviewSessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        InterviewSession low = sessions.stream()
                .filter(s -> s.getDeletedAt() == null && s.getStatus() == InterviewStatus.COMPLETED)
                .filter(s -> s.getOverallScore() != null && s.getOverallScore().compareTo(BigDecimal.valueOf(60)) < 0)
                .findFirst()
                .orElse(null);
        if (low == null)
            return;
        if (notificationRepository.existsRecentByUserAndType(
                user.getId(), NotificationType.RETRY_INTERVIEW, LocalDateTime.now().minusDays(7))) {
            return;
        }
        Map<String, Object> meta = new HashMap<>();
        meta.put("sessionId", low.getId().toString());
        create(user, NotificationType.RETRY_INTERVIEW,
                "Gợi ý luyện lại phỏng vấn",
                "Buổi \"" + (low.getTitle() != null ? low.getTitle() : low.getRoleSnapshot())
                        + "\" có điểm thấp. Thử lại để cải thiện kết quả.",
                frontendUrl + "/interview-setup?retrySessionId=" + low.getId(),
                "Luyện lại",
                meta);
    }

    private void create(User user, NotificationType type, String title, String content,
            String actionUrl, String actionLabel, Map<String, Object> metadata) {
        notificationRepository.save(Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .content(content)
                .actionUrl(actionUrl)
                .actionLabel(actionLabel)
                .metadata(metadata)
                .isRead(false)
                .build());
    }

    private NotificationResponse map(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .content(n.getContent())
                .actionUrl(n.getActionUrl())
                .actionLabel(n.getActionLabel())
                .read(Boolean.TRUE.equals(n.getIsRead()))
                .metadata(n.getMetadata())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            throw new AppException("Authentication required");
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new AppException("User not found"));
    }
}
