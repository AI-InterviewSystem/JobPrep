package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardResponse {

    private OverviewStats overview;
    private StreakInfo streak;
    private SessionStats sessionStats;
    private List<SkillScore> skillScores;
    private List<ScoreChartPoint> scoreChart;
    private List<TopicStat> topicPracticeCounts;
    private List<TopicInsight> weakTopics;
    private List<TopicInsight> strongTopics;
    private List<RecentSessionItem> recentSessions;
    private List<AchievementItem> achievements;
    private String progressSummary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewStats {
        private BigDecimal averageOverallScore;
        private BigDecimal averageTechnicalScore;
        private BigDecimal averageCommunicationScore;
        private BigDecimal averageConfidenceScore;
        private int totalPracticeSessions;
        private int completedPracticeSessions;
        private int totalInterviewSessions;
        private int completedInterviewSessions;
        private int retryInterviewSessions;
        private LocalDateTime lastActivityAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StreakInfo {
        private int currentStreak;
        private int longestStreak;
        private boolean practicedToday;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionStats {
        private List<CountByLabel> byRole;
        private List<CountByLabel> byLevel;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CountByLabel {
        private String label;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillScore {
        private String label;
        private BigDecimal score;
        private int percent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreChartPoint {
        private String date;
        private String sessionType;
        private String title;
        private BigDecimal overallScore;
        private BigDecimal technicalScore;
        private BigDecimal communicationScore;
        private BigDecimal confidenceScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicStat {
        private Integer topicId;
        private String topicName;
        private int totalPracticed;
        private int correctCount;
        private BigDecimal avgScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicInsight {
        private Integer topicId;
        private String topicName;
        private BigDecimal avgScore;
        private int totalPracticed;
        private int correctCount;
        private String suggestion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSessionItem {
        private UUID id;
        private String title;
        private String role;
        private String level;
        private String status;
        private BigDecimal overallScore;
        private LocalDateTime completedAt;
        private UUID retryOfSessionId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementItem {
        private String code;
        private String name;
        private String description;
        private String condition;
        private boolean unlocked;
        private LocalDateTime unlockedAt;
        private String icon;
    }
}
