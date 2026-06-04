package com.aiinterview.backend.service;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.UserLearningStats;
import com.aiinterview.backend.repository.UserLearningStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserLearningStatsService {

    private final UserLearningStatsRepository statsRepository;

    @Transactional
    public UserLearningStats recordActivity(User user) {
        LocalDate today = LocalDate.now();
        UserLearningStats stats = statsRepository.findById(user.getId())
                .orElseGet(() -> UserLearningStats.builder()
                        .user(user)
                        .currentStreak(0)
                        .longestStreak(0)
                        .practiceReminders(true)
                        .subscriptionAlerts(true)
                        .learningSuggestions(true)
                        .build());

        if (stats.getLastActivityDate() == null) {
            stats.setCurrentStreak(1);
        } else if (stats.getLastActivityDate().equals(today)) {
            // same day — streak unchanged
        } else if (stats.getLastActivityDate().equals(today.minusDays(1))) {
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
        } else {
            stats.setCurrentStreak(1);
        }

        stats.setLastActivityDate(today);
        if (stats.getCurrentStreak() > stats.getLongestStreak()) {
            stats.setLongestStreak(stats.getCurrentStreak());
        }
        return statsRepository.save(stats);
    }

    @Transactional(readOnly = true)
    public UserLearningStats getOrCreate(User user) {
        return statsRepository.findById(user.getId())
                .orElseGet(() -> UserLearningStats.builder()
                        .user(user)
                        .currentStreak(0)
                        .longestStreak(0)
                        .practiceReminders(true)
                        .subscriptionAlerts(true)
                        .learningSuggestions(true)
                        .build());
    }

    @Transactional
    public UserLearningStats savePreferences(User user, Boolean practiceReminders, Boolean subscriptionAlerts, Boolean learningSuggestions) {
        UserLearningStats stats = statsRepository.findById(user.getId())
                .orElseGet(() -> UserLearningStats.builder().user(user).build());
        if (practiceReminders != null) stats.setPracticeReminders(practiceReminders);
        if (subscriptionAlerts != null) stats.setSubscriptionAlerts(subscriptionAlerts);
        if (learningSuggestions != null) stats.setLearningSuggestions(learningSuggestions);
        return statsRepository.save(stats);
    }
}
