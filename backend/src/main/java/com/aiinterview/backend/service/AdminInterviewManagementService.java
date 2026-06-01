package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.AdminInterviewAnalyticsResponse;
import com.aiinterview.backend.dto.AdminInterviewSessionResponse;
import com.aiinterview.backend.dto.AdminReportsResponse;
import com.aiinterview.backend.dto.InterviewSessionResponse;
import com.aiinterview.backend.entity.InterviewAnswer;
import com.aiinterview.backend.entity.InterviewQuestion;
import com.aiinterview.backend.entity.InterviewRecording;
import com.aiinterview.backend.entity.InterviewSession;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.InterviewAnswerRepository;
import com.aiinterview.backend.repository.InterviewQuestionRepository;
import com.aiinterview.backend.repository.InterviewRecordingRepository;
import com.aiinterview.backend.repository.InterviewSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminInterviewManagementService {

    private final JdbcTemplate jdbcTemplate;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewRecordingRepository recordingRepository;
    private final InterviewRecordingService interviewRecordingService;

    @Transactional(readOnly = true)
    public List<AdminInterviewSessionResponse> searchSessions(
            String keyword,
            String status,
            LocalDate fromDate,
            LocalDate toDate,
            BigDecimal minScore,
            BigDecimal maxScore,
            String role,
            String level,
            String interviewType) {
        StringBuilder sql = new StringBuilder("""
                SELECT DISTINCT s.id, u.id AS user_id, u.email, p.full_name, s.title, s.status,
                       s.role_snapshot, s.level_snapshot, s.interview_type, s.overall_score,
                       s.total_questions, s.completed_questions, s.duration_seconds,
                       s.created_at, s.start_time, s.end_time
                FROM interview_sessions s
                JOIN users u ON u.id = s.user_id
                LEFT JOIN profiles p ON p.user_id = u.id
                LEFT JOIN job_descriptions jd ON jd.id = s.job_description_id
                LEFT JOIN interview_questions q ON q.session_id = s.id
                WHERE s.deleted_at IS NULL
                """);
        List<Object> params = new ArrayList<>();

        String cleanStatus = clean(status);
        if (cleanStatus != null) {
            sql.append(" AND LOWER(CAST(s.status AS TEXT)) = LOWER(?)");
            params.add(cleanStatus);
        }
        if (fromDate != null) {
            sql.append(" AND CAST(s.created_at AS DATE) >= ?");
            params.add(fromDate);
        }
        if (toDate != null) {
            sql.append(" AND CAST(s.created_at AS DATE) <= ?");
            params.add(toDate);
        }
        if (minScore != null) {
            sql.append(" AND s.overall_score >= ?");
            params.add(minScore);
        }
        if (maxScore != null) {
            sql.append(" AND s.overall_score <= ?");
            params.add(maxScore);
        }

        String cleanRole = clean(role);
        if (cleanRole != null) {
            sql.append("""
                     AND (
                          LOWER(COALESCE(s.role_snapshot, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(s.title, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(jd.job_description_text, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(q.job_requirement_tag, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                     )
                    """);
            params.add(cleanRole);
            params.add(cleanRole);
            params.add(cleanRole);
            params.add(cleanRole);
        }

        String cleanLevel = clean(level);
        if (cleanLevel != null) {
            sql.append(" AND LOWER(COALESCE(s.level_snapshot, '')) = LOWER(?)");
            params.add(cleanLevel);
        }

        String cleanInterviewType = clean(interviewType);
        if (cleanInterviewType != null) {
            sql.append(" AND LOWER(COALESCE(s.interview_type, '')) = LOWER(?)");
            params.add(cleanInterviewType);
        }

        String cleanKeyword = clean(keyword);
        if (cleanKeyword != null) {
            sql.append("""
                     AND (
                          LOWER(u.email) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(p.full_name, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(s.title, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(s.role_snapshot, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(s.level_snapshot, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                          OR LOWER(COALESCE(jd.job_description_text, '')) LIKE LOWER(CONCAT('%', ?, '%'))
                     )
                    """);
            params.add(cleanKeyword);
            params.add(cleanKeyword);
            params.add(cleanKeyword);
            params.add(cleanKeyword);
            params.add(cleanKeyword);
            params.add(cleanKeyword);
        }

        sql.append(" ORDER BY s.created_at DESC");

        return jdbcTemplate.query(sql.toString(), this::mapSessionRow, params.toArray());
    }

    @Transactional(readOnly = true)
    public InterviewSessionResponse getSessionDetail(UUID sessionId) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException("Session not found"));
        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        return buildDetailResponse(session, questions);
    }

    @Transactional(readOnly = true)
    public AdminInterviewAnalyticsResponse getInterviewAnalytics() {
        long total = count("SELECT COUNT(*) FROM interview_sessions WHERE deleted_at IS NULL");
        long completed = count("SELECT COUNT(*) FROM interview_sessions WHERE deleted_at IS NULL AND status = 'COMPLETED'");
        long inProgress = count("SELECT COUNT(*) FROM interview_sessions WHERE deleted_at IS NULL AND status = 'IN_PROGRESS'");
        long abandoned = count("""
                SELECT COUNT(*) FROM interview_sessions
                WHERE deleted_at IS NULL
                  AND status IN ('CREATED', 'IN_PROGRESS')
                  AND created_at < now() - interval '1 day'
                """);
        BigDecimal avgScore = value("SELECT COALESCE(AVG(overall_score), 0) FROM interview_sessions WHERE deleted_at IS NULL AND overall_score IS NOT NULL");

        return AdminInterviewAnalyticsResponse.builder()
                .totalSessions(total)
                .completedSessions(completed)
                .inProgressSessions(inProgress)
                .abandonedSessions(abandoned)
                .averageScore(avgScore)
                .completionRate(total > 0 ? completed * 100.0 / total : 0)
                .abandonmentRate(total > 0 ? abandoned * 100.0 / total : 0)
                .popularRoles(labelCounts("""
                        SELECT COALESCE(NULLIF(role_snapshot, ''), 'Unknown') label, COUNT(*) count, NULL::numeric value
                        FROM interview_sessions WHERE deleted_at IS NULL
                        GROUP BY label ORDER BY count DESC LIMIT 8
                        """))
                .weakTopics(labelCounts("""
                        SELECT COALESCE(NULLIF(q.job_requirement_tag, ''), 'General') label,
                               COUNT(*) count,
                               AVG(a.score)::numeric value
                        FROM interview_questions q
                        JOIN interview_answers a ON a.question_id = q.id
                        WHERE a.score IS NOT NULL AND a.score < 70
                        GROUP BY label ORDER BY count DESC, value ASC LIMIT 8
                        """))
                .sessionsByDay(chart("""
                        SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') label, COUNT(*)::numeric value
                        FROM interview_sessions
                        WHERE deleted_at IS NULL AND created_at >= now() - interval '30 days'
                        GROUP BY created_at::date ORDER BY created_at::date
                        """))
                .build();
    }

    @Transactional(readOnly = true)
    public AdminReportsResponse getReports() {
        return AdminReportsResponse.builder()
                .userGrowth(chart("""
                        SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') label, COUNT(*)::numeric value
                        FROM users WHERE created_at >= now() - interval '30 days'
                        GROUP BY created_at::date ORDER BY created_at::date
                        """))
                .interviewUsage(chart("""
                        SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') label, COUNT(*)::numeric value
                        FROM interview_sessions
                        WHERE deleted_at IS NULL AND created_at >= now() - interval '30 days'
                        GROUP BY created_at::date ORDER BY created_at::date
                        """))
                .revenue(chart("""
                        SELECT TO_CHAR(paid_at::date, 'YYYY-MM-DD') label, COALESCE(SUM(amount), 0)::numeric value
                        FROM payments
                        WHERE status = 'PAID' AND paid_at >= now() - interval '30 days'
                        GROUP BY paid_at::date ORDER BY paid_at::date
                        """))
                .subscriptionPerformance(labelCounts("""
                        SELECT us.status AS label, COUNT(*) count, NULL::numeric value
                        FROM user_subscriptions us GROUP BY us.status ORDER BY count DESC
                        """))
                .questionUsage(labelCounts("""
                        SELECT LEFT(q.question_text, 120) label, COUNT(*) count, AVG(a.score)::numeric value
                        FROM interview_questions q
                        LEFT JOIN interview_answers a ON a.question_id = q.id
                        GROUP BY q.question_text ORDER BY count DESC LIMIT 10
                        """))
                .lowScoreQuestions(labelCounts("""
                        SELECT LEFT(q.question_text, 120) label, COUNT(*) count, AVG(a.score)::numeric value
                        FROM interview_questions q
                        JOIN interview_answers a ON a.question_id = q.id
                        WHERE a.score IS NOT NULL
                        GROUP BY q.question_text HAVING AVG(a.score) < 70
                        ORDER BY value ASC, count DESC LIMIT 10
                        """))
                .weakTopics(labelCounts("""
                        SELECT COALESCE(NULLIF(q.job_requirement_tag, ''), 'General') label, COUNT(*) count, AVG(a.score)::numeric value
                        FROM interview_questions q
                        JOIN interview_answers a ON a.question_id = q.id
                        WHERE a.score IS NOT NULL
                        GROUP BY label HAVING AVG(a.score) < 70
                        ORDER BY value ASC, count DESC LIMIT 10
                        """))
                .progressTrend(chart("""
                        SELECT TO_CHAR(s.created_at::date, 'YYYY-MM-DD') label, AVG(s.overall_score)::numeric value
                        FROM interview_sessions s
                        WHERE s.deleted_at IS NULL AND s.overall_score IS NOT NULL AND s.created_at >= now() - interval '60 days'
                        GROUP BY s.created_at::date ORDER BY s.created_at::date
                        """))
                .activeUsers30d(count("SELECT COUNT(DISTINCT user_id) FROM interview_sessions WHERE created_at >= now() - interval '30 days'"))
                .returningUsers30d(count("""
                        SELECT COUNT(*) FROM (
                            SELECT user_id FROM interview_sessions
                            WHERE created_at >= now() - interval '30 days'
                            GROUP BY user_id HAVING COUNT(*) > 1
                        ) t
                        """))
                .activeSubscriptions(count("SELECT COUNT(*) FROM user_subscriptions WHERE status IN ('ACTIVE', 'ACTIVE_NON_RENEWING')"))
                .expiringSubscriptions7d(count("""
                        SELECT COUNT(*) FROM user_subscriptions
                        WHERE status IN ('ACTIVE', 'ACTIVE_NON_RENEWING')
                          AND current_period_end BETWEEN now() AND now() + interval '7 days'
                        """))
                .cancelledSubscriptions(count("SELECT COUNT(*) FROM user_subscriptions WHERE status = 'CANCELLED' OR cancel_at_period_end = true"))
                .totalRevenue(value("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'PAID'"))
                .build();
    }

    public String exportReportCsv(String reportType) {
        AdminReportsResponse reports = getReports();
        StringBuilder csv = new StringBuilder();
        csv.append("report,label,count_or_value,average\n");
        appendChart(csv, "user_growth", reports.getUserGrowth());
        appendChart(csv, "interview_usage", reports.getInterviewUsage());
        appendChart(csv, "revenue", reports.getRevenue());
        appendLabels(csv, "subscription_performance", reports.getSubscriptionPerformance());
        appendLabels(csv, "question_usage", reports.getQuestionUsage());
        appendLabels(csv, "low_score_questions", reports.getLowScoreQuestions());
        appendLabels(csv, "weak_topics", reports.getWeakTopics());
        appendChart(csv, "progress_trend", reports.getProgressTrend());
        return csv.toString();
    }

    private InterviewSessionResponse buildDetailResponse(InterviewSession session, List<InterviewQuestion> questions) {
        Map<UUID, InterviewAnswer> answersByQuestionId = answerRepository.findByQuestionSessionId(session.getId()).stream()
                .filter(answer -> answer.getQuestion() != null)
                .collect(Collectors.toMap(answer -> answer.getQuestion().getId(), answer -> answer, (first, second) -> second));
        Map<UUID, List<InterviewRecording>> recordingsByQuestionId = recordingRepository
                .findBySessionIdAndDeletedAtIsNullOrderByCreatedAtAsc(session.getId())
                .stream()
                .filter(recording -> recording.getQuestion() != null)
                .collect(Collectors.groupingBy(recording -> recording.getQuestion().getId()));

        return InterviewSessionResponse.builder()
                .id(session.getId())
                .status(session.getStatus())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .title(session.getTitle())
                .interviewType(session.getInterviewType())
                .roleSnapshot(session.getRoleSnapshot())
                .levelSnapshot(session.getLevelSnapshot())
                .totalQuestions(session.getTotalQuestions())
                .completedQuestions(session.getCompletedQuestions())
                .durationSeconds(session.getDurationSeconds())
                .overallScore(session.getOverallScore())
                .technicalScore(session.getTechnicalScore())
                .communicationScore(session.getCommunicationScore())
                .confidenceScore(session.getConfidenceScore())
                .problemSolvingScore(session.getProblemSolvingScore())
                .clarityScore(session.getClarityScore())
                .strengths(session.getStrengths())
                .weaknesses(session.getWeaknesses())
                .summaryText(session.getSummaryText())
                .nextSteps(session.getNextSteps())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .questions(questions.stream().map(q -> com.aiinterview.backend.dto.InterviewQuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionSource(q.getQuestionSource())
                        .jobRequirementTag(q.getJobRequirementTag())
                        .orderIndex(q.getOrderIndex())
                        .createdAt(q.getCreatedAt())
                        .answer(toAnswerResponse(answersByQuestionId.get(q.getId())))
                        .recordings(recordingsByQuestionId.getOrDefault(q.getId(), Collections.emptyList()).stream()
                                .map(interviewRecordingService::toResponse)
                                .collect(Collectors.toList()))
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private com.aiinterview.backend.dto.InterviewAnswerResponse toAnswerResponse(InterviewAnswer answer) {
        if (answer == null) return null;
        return com.aiinterview.backend.dto.InterviewAnswerResponse.builder()
                .id(answer.getId())
                .questionId(answer.getQuestion() != null ? answer.getQuestion().getId() : null)
                .answerText(answer.getAnswerText())
                .audioStoragePath(answer.getAudioStoragePath())
                .durationSeconds(answer.getDurationSeconds())
                .inputType(answer.getInputType())
                .score(answer.getScore())
                .feedback(answer.getFeedback())
                .strengths(answer.getStrengths())
                .weaknesses(answer.getWeaknesses())
                .improvedAnswer(answer.getImprovedAnswer())
                .isAnswerRelevant(answer.getIsAnswerRelevant())
                .createdAt(answer.getCreatedAt())
                .build();
    }

    private AdminInterviewSessionResponse mapSessionRow(ResultSet rs, int rowNum) throws SQLException {
        return AdminInterviewSessionResponse.builder()
                .id(UUID.fromString(rs.getString("id")))
                .userId(UUID.fromString(rs.getString("user_id")))
                .candidateEmail(rs.getString("email"))
                .candidateName(rs.getString("full_name"))
                .title(rs.getString("title"))
                .status(InterviewSession.InterviewStatus.valueOf(rs.getString("status")))
                .roleSnapshot(rs.getString("role_snapshot"))
                .levelSnapshot(rs.getString("level_snapshot"))
                .interviewType(rs.getString("interview_type"))
                .overallScore(rs.getBigDecimal("overall_score"))
                .totalQuestions((Integer) rs.getObject("total_questions"))
                .completedQuestions((Integer) rs.getObject("completed_questions"))
                .durationSeconds((Integer) rs.getObject("duration_seconds"))
                .createdAt(timestamp(rs, "created_at"))
                .startTime(timestamp(rs, "start_time"))
                .endTime(timestamp(rs, "end_time"))
                .build();
    }

    private List<AdminInterviewAnalyticsResponse.LabelCount> labelCounts(String sql) {
        return jdbcTemplate.query(sql, (rs, rowNum) -> AdminInterviewAnalyticsResponse.LabelCount.builder()
                .label(rs.getString("label"))
                .count(rs.getLong("count"))
                .value(rs.getBigDecimal("value"))
                .build());
    }

    private List<AdminInterviewAnalyticsResponse.ChartPoint> chart(String sql) {
        return jdbcTemplate.query(sql, (rs, rowNum) -> AdminInterviewAnalyticsResponse.ChartPoint.builder()
                .label(rs.getString("label"))
                .value(rs.getBigDecimal("value"))
                .build());
    }

    private long count(String sql) {
        Long value = jdbcTemplate.queryForObject(sql, Long.class);
        return value != null ? value : 0;
    }

    private BigDecimal value(String sql) {
        BigDecimal value = jdbcTemplate.queryForObject(sql, BigDecimal.class);
        return value != null ? value : BigDecimal.ZERO;
    }

    private LocalDateTime timestamp(ResultSet rs, String column) throws SQLException {
        var ts = rs.getTimestamp(column);
        return ts != null ? ts.toLocalDateTime() : null;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void appendChart(StringBuilder csv, String report, List<AdminInterviewAnalyticsResponse.ChartPoint> rows) {
        for (var row : rows) {
            csv.append(report).append(',').append(escape(row.getLabel())).append(',').append(row.getValue()).append(",\n");
        }
    }

    private void appendLabels(StringBuilder csv, String report, List<AdminInterviewAnalyticsResponse.LabelCount> rows) {
        for (var row : rows) {
            csv.append(report).append(',').append(escape(row.getLabel())).append(',').append(row.getCount()).append(',').append(row.getValue()).append('\n');
        }
    }

    private String escape(String value) {
        if (value == null) return "";
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }
}
