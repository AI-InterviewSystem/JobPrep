package com.aiinterview.backend.scheduler;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 8 * * *")
    public void generateDailyNotifications() {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> !Boolean.TRUE.equals(u.getIsBanned()))
                .toList();
        for (User user : users) {
            try {
                notificationService.syncSystemNotifications(user);
            } catch (Exception e) {
                log.warn("Failed to sync notifications for user {}: {}", user.getEmail(), e.getMessage());
            }
        }
        log.info("Daily notification sync completed for {} users", users.size());
    }
}
