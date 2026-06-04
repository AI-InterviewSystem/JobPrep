package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.UserDashboardResponse;
import com.aiinterview.backend.dto.UserDashboardResponse.*;
import com.aiinterview.backend.entity.InterviewSession;
import com.aiinterview.backend.entity.InterviewSession.InterviewStatus;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.UserLearningStats;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.InterviewSessionRepository;
import com.aiinterview.backend.repository.PracticeSessionRepository;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDashboardService {

        private final UserRepository userRepository;
        private final InterviewSessionRepository interviewSessionRepository;
        private final PracticeSessionRepository practiceSessionRepository;
        private final UserLearningStatsService learningStatsService;
        private final NotificationService notificationService;
        private final JdbcTemplate jdbcTemplate;

        private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

        @Transactional(readOnly = true)
        public UserDashboardResponse getDashboard() {
                User user = getCurrentUser();
                notificationService.syncSystemNotifications(user);

                List<InterviewSession> interviews = interviewSessionRepository
                                .findByUserIdOrderByCreatedAtDesc(user.getId())
                                .stream()
                                .filter(s -> s.getDeletedAt() == null)
                                .toList();

                List<InterviewSession> completedInterviews = interviews.stream()
                                .filter(s -> s.getStatus() == InterviewStatus.COMPLETED)
                                .toList();

                long totalInterviews = interviews.size();
                long completedInterviewCount = completedInterviews.size();
                long retryCount = interviewSessionRepository
                                .countByUserIdAndRetryOfSessionIdIsNotNullAndDeletedAtIsNull(user.getId());

                long totalPractice = practiceSessionRepository.countByUserId(user.getId());
                long completedPractice = practiceSessionRepository.countByUserIdAndStatus(user.getId(), "completed");

                UserLearningStats stats = learningStatsService.getOrCreate(user);
                LocalDate today = LocalDate.now();

                OverviewStats overview = OverviewStats.builder()
                                .averageOverallScore(avgScore(
                                                completedInterviews.stream().map(InterviewSession::getOverallScore)
                                                                .filter(Objects::nonNull).toList()))
                                .averageTechnicalScore(avgScore(
                                                completedInterviews.stream().map(InterviewSession::getTechnicalScore)
                                                                .filter(Objects::nonNull).toList()))
                                .averageCommunicationScore(avgScore(completedInterviews.stream()
                                                .map(InterviewSession::getCommunicationScore).filter(Objects::nonNull)
                                                .toList()))
                                .averageConfidenceScore(avgScore(
                                                completedInterviews.stream().map(InterviewSession::getConfidenceScore)
                                                                .filter(Objects::nonNull).toList()))
                                .totalPracticeSessions((int) totalPractice)
                                .completedPracticeSessions((int) completedPractice)
                                .totalInterviewSessions((int) totalInterviews)
                                .completedInterviewSessions((int) completedInterviewCount)
                                .retryInterviewSessions((int) retryCount)
                                .lastActivityAt(findLastActivity(interviews, user.getId()))
                                .build();

                StreakInfo streak = StreakInfo.builder()
                                .currentStreak(stats.getCurrentStreak() != null ? stats.getCurrentStreak() : 0)
                                .longestStreak(stats.getLongestStreak() != null ? stats.getLongestStreak() : 0)
                                .practicedToday(today.equals(stats.getLastActivityDate()))
                                .build();

                SessionStats sessionStats = SessionStats.builder()
                                .byRole(groupInterviewCounts(completedInterviews, InterviewSession::getRoleSnapshot))
                                .byLevel(groupInterviewCounts(completedInterviews, InterviewSession::getLevelSnapshot))
                                .build();

                List<TopicStat> topicStats = loadTopicStats(user.getId());
                List<TopicInsight> weakTopics = buildWeakTopics(topicStats);
                List<TopicInsight> strongTopics = buildStrongTopics(topicStats);

                List<AchievementItem> achievements = buildAchievements(user.getId(), completedInterviewCount, streak,
                                topicStats);

                return UserDashboardResponse.builder()
                                .overview(overview)
                                .streak(streak)
                                .sessionStats(sessionStats)
                                .skillScores(buildSkillScores(completedInterviews))
                                .scoreChart(buildScoreChart(interviews))
                                .topicPracticeCounts(topicStats)
                                .weakTopics(weakTopics)
                                .strongTopics(strongTopics)
                                .recentSessions(buildRecentSessions(interviews))
                                .achievements(achievements)
                                .progressSummary(buildProgressSummary(overview, streak, weakTopics, strongTopics,
                                                achievements))
                                .build();
        }

        private List<TopicStat> loadTopicStats(UUID userId) {
                return jdbcTemplate.query("""
                                SELECT m.topic_id, t.name, m.total_practiced, m.correct_count, m.avg_score
                                FROM user_topic_metrics m
                                JOIN question_topics t ON t.id = m.topic_id
                                WHERE m.user_id = ?
                                ORDER BY m.total_practiced DESC
                                """,
                                (rs, rowNum) -> TopicStat.builder()
                                                .topicId(rs.getInt("topic_id"))
                                                .topicName(rs.getString("name"))
                                                .totalPracticed(rs.getInt("total_practiced"))
                                                .correctCount(rs.getInt("correct_count"))
                                                .avgScore(rs.getBigDecimal("avg_score"))
                                                .build(),
                                userId);
        }

        private List<TopicInsight> buildWeakTopics(List<TopicStat> topicStats) {
                return topicStats.stream()
                                .filter(t -> t.getTotalPracticed() >= 1)
                                .sorted(Comparator.comparing(
                                                t -> t.getAvgScore() != null ? t.getAvgScore() : BigDecimal.ZERO))
                                .limit(5)
                                .map(t -> TopicInsight.builder()
                                                .topicId(t.getTopicId())
                                                .topicName(t.getTopicName())
                                                .avgScore(t.getAvgScore())
                                                .totalPracticed(t.getTotalPracticed())
                                                .correctCount(t.getCorrectCount())
                                                .suggestion("Spend more time practicing " + t.getTopicName()
                                                                + " in the Question Bank.")
                                                .build())
                                .toList();
        }

        private List<TopicInsight> buildStrongTopics(List<TopicStat> topicStats) {
                return topicStats.stream()
                                .filter(t -> t.getAvgScore() != null
                                                && t.getAvgScore().compareTo(BigDecimal.valueOf(70)) >= 0)
                                .sorted(Comparator.comparing(TopicStat::getAvgScore).reversed())
                                .limit(5)
                                .map(t -> TopicInsight.builder()
                                                .topicId(t.getTopicId())
                                                .topicName(t.getTopicName())
                                                .avgScore(t.getAvgScore())
                                                .totalPracticed(t.getTotalPracticed())
                                                .correctCount(t.getCorrectCount())
                                                .suggestion("Great job! Keep maintaining your " + t.getTopicName()
                                                                + " skills.")
                                                .build())
                                .toList();
        }

        private List<SkillScore> buildSkillScores(List<InterviewSession> completed) {
                List<InterviewSession> recent = completed.stream().limit(10).toList();
                return List.of(
                                skill("Communication",
                                                avgScore(recent.stream().map(InterviewSession::getCommunicationScore)
                                                                .filter(Objects::nonNull).toList())),
                                skill("Technical",
                                                avgScore(recent.stream().map(InterviewSession::getTechnicalScore)
                                                                .filter(Objects::nonNull).toList())),
                                skill("Confidence",
                                                avgScore(recent.stream().map(InterviewSession::getConfidenceScore)
                                                                .filter(Objects::nonNull).toList())),
                                skill("Problem Solving",
                                                avgScore(recent.stream().map(InterviewSession::getProblemSolvingScore)
                                                                .filter(Objects::nonNull).toList())));
        }

        private SkillScore skill(String label, BigDecimal score) {
                int percent = score != null ? score.setScale(0, RoundingMode.HALF_UP).intValue() : 0;
                return SkillScore.builder().label(label).score(score).percent(Math.min(100, Math.max(0, percent)))
                                .build();
        }

        private List<ScoreChartPoint> buildScoreChart(List<InterviewSession> allSessions) {
                LocalDate from = LocalDate.now().minusDays(30);
                return allSessions.stream()
                                .filter(s -> s.getOverallScore() != null)
                                .filter(s -> {
                                        LocalDateTime dt = s.getEndTime() != null ? s.getEndTime() : s.getCreatedAt();
                                        return dt != null && !dt.toLocalDate().isBefore(from);
                                })
                                .sorted(Comparator.comparing(
                                                s -> s.getEndTime() != null ? s.getEndTime() : s.getCreatedAt()))
                                .map(s -> {
                                        LocalDateTime dt = s.getEndTime() != null ? s.getEndTime() : s.getCreatedAt();
                                        return ScoreChartPoint.builder()
                                                        .date(dt.toLocalDate().format(DATE_FMT))
                                                        .sessionType("interview")
                                                        .title(s.getTitle() != null ? s.getTitle()
                                                                        : s.getRoleSnapshot())
                                                        .overallScore(s.getOverallScore())
                                                        .technicalScore(s.getTechnicalScore())
                                                        .communicationScore(s.getCommunicationScore())
                                                        .confidenceScore(s.getConfidenceScore())
                                                        .build();
                                })
                                .toList();
        }

        private List<RecentSessionItem> buildRecentSessions(List<InterviewSession> interviews) {
                return interviews.stream().limit(5).map(s -> RecentSessionItem.builder()
                                .id(s.getId())
                                .title(s.getTitle())
                                .role(s.getRoleSnapshot())
                                .level(s.getLevelSnapshot())
                                .status(s.getStatus() != null ? s.getStatus().name() : null)
                                .overallScore(s.getOverallScore())
                                .completedAt(s.getEndTime() != null ? s.getEndTime() : s.getCreatedAt())
                                .retryOfSessionId(s.getRetryOfSessionId())
                                .build()).toList();
        }

        private List<AchievementItem> buildAchievements(UUID userId, long completedInterviews, StreakInfo streak,
                        List<TopicStat> topicStats) {
                int maxTopicPracticed = topicStats.stream().mapToInt(TopicStat::getTotalPracticed).max().orElse(0);
                BigDecimal bestScore = jdbcTemplate.query("""
                                SELECT MAX(overall_score) FROM interview_sessions
                                WHERE user_id = ? AND deleted_at IS NULL AND status = 'COMPLETED'
                                """, rs -> rs.next() ? rs.getBigDecimal(1) : null, userId);

                List<AchievementDef> defs = List.of(
                                new AchievementDef("FIRST_INTERVIEW", "First Interview",
                                                "Complete your first mock interview", "1 completed interview",
                                                "military_tech", completedInterviews >= 1),
                                new AchievementDef("FIVE_INTERVIEWS", "Interview Regular",
                                                "Complete 5 mock interviews", "5 completed interviews",
                                                "workspace_premium", completedInterviews >= 5),
                                new AchievementDef("SCORE_80", "High Performer",
                                                "Score 80 or higher in a single session",
                                                "Overall score ≥ 80", "stars",
                                                bestScore != null && bestScore.compareTo(BigDecimal.valueOf(80)) >= 0),
                                new AchievementDef("STREAK_7", "Week Warrior", "Practice for 7 consecutive days",
                                                "7-day streak", "local_fire_department",
                                                streak.getCurrentStreak() >= 7 || streak.getLongestStreak() >= 7),
                                new AchievementDef("TOPIC_20", "Topic Master",
                                                "Practice 20 questions in a single topic",
                                                "20 questions / topic", "school", maxTopicPracticed >= 20),
                                new AchievementDef("PRACTICE_10", "Question Grinder",
                                                "Complete 10 Question Bank practice sessions", "10 practice sessions",
                                                "quiz", practiceSessionRepository.countByUserIdAndStatus(userId,
                                                                "completed") >= 10));

                return defs.stream().map(d -> AchievementItem.builder()
                                .code(d.code)
                                .name(d.name)
                                .description(d.description)
                                .condition(d.condition)
                                .unlocked(d.unlocked)
                                .icon(d.icon)
                                .build()).toList();
        }

        private String buildProgressSummary(OverviewStats overview, StreakInfo streak, List<TopicInsight> weak,
                        List<TopicInsight> strong, List<AchievementItem> achievements) {
                StringBuilder sb = new StringBuilder();
                if (overview.getCompletedInterviewSessions() == 0 && overview.getCompletedPracticeSessions() == 0) {
                        sb.append("You haven't started practicing yet. Begin with a Mock Interview or Question Bank.");
                        return sb.toString();
                }
                if (overview.getAverageOverallScore() != null) {
                        sb.append("Average interview score: ")
                                        .append(overview.getAverageOverallScore().setScale(1, RoundingMode.HALF_UP))
                                        .append(". ");
                }
                sb.append("Current streak: ").append(streak.getCurrentStreak()).append(" days. ");
                if (!weak.isEmpty()) {
                        sb.append("Focus on: ").append(
                                        weak.stream().map(TopicInsight::getTopicName).collect(Collectors.joining(", ")))
                                        .append(". ");
                }
                if (!strong.isEmpty()) {
                        sb.append("Strongest in: ").append(strong.stream().map(TopicInsight::getTopicName)
                                        .collect(Collectors.joining(", "))).append(". ");
                }
                long unlocked = achievements.stream().filter(AchievementItem::isUnlocked).count();
                sb.append("Unlocked ").append(unlocked).append("/").append(achievements.size()).append(" badges.");
                return sb.toString().trim();
        }

        private List<CountByLabel> groupInterviewCounts(List<InterviewSession> sessions,
                        java.util.function.Function<InterviewSession, String> extractor) {
                Map<String, Long> grouped = sessions.stream()
                                .map(extractor)
                                .filter(v -> v != null && !v.isBlank())
                                .collect(Collectors.groupingBy(String::trim, Collectors.counting()));
                return grouped.entrySet().stream()
                                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                                .map(e -> CountByLabel.builder().label(e.getKey()).count(e.getValue()).build())
                                .toList();
        }

        private LocalDateTime findLastActivity(List<InterviewSession> interviews, UUID userId) {
                LocalDateTime lastInterview = interviews.stream()
                                .map(s -> s.getEndTime() != null ? s.getEndTime() : s.getCreatedAt())
                                .filter(Objects::nonNull)
                                .max(LocalDateTime::compareTo)
                                .orElse(null);
                LocalDateTime lastPractice = jdbcTemplate.query("""
                                SELECT MAX(COALESCE(completed_at, started_at)) FROM practice_sessions WHERE user_id = ?
                                """, rs -> rs.next() && rs.getTimestamp(1) != null
                                ? rs.getTimestamp(1).toLocalDateTime()
                                : null, userId);
                if (lastInterview == null)
                        return lastPractice;
                if (lastPractice == null)
                        return lastInterview;
                return lastInterview.isAfter(lastPractice) ? lastInterview : lastPractice;
        }

        private BigDecimal avgScore(List<BigDecimal> scores) {
                if (scores.isEmpty())
                        return null;
                BigDecimal sum = scores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                return sum.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP);
        }

        private User getCurrentUser() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || !auth.isAuthenticated())
                        throw new AppException("Authentication required");
                return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new AppException("User not found"));
        }

        private record AchievementDef(String code, String name, String description, String condition, String icon,
                        boolean unlocked) {
        }
}
