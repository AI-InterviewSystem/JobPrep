package com.aiinterview.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    public enum InterviewStatus {
        CREATED,
        IN_PROGRESS,
        COMPLETED
    }

    public enum InterviewLanguage {
        EN,
        VI
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ai_session_id")
    private String aiSessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id")
    private JobDescription jobDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private InterviewStatus status = InterviewStatus.CREATED;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "title")
    private String title;

    @Column(name = "interview_type", length = 50)
    @Builder.Default
    private String interviewType = "mock";

    @Enumerated(EnumType.STRING)
    @Column(name = "interview_language", length = 10)
    @Builder.Default
    private InterviewLanguage interviewLanguage = InterviewLanguage.EN;

    @Column(name = "role_snapshot", length = 100)
    private String roleSnapshot;

    @Column(name = "level_snapshot", length = 100)
    private String levelSnapshot;

    @Column(name = "total_questions")
    @Builder.Default
    private Integer totalQuestions = 0;

    @Column(name = "completed_questions")
    @Builder.Default
    private Integer completedQuestions = 0;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "technical_score", precision = 5, scale = 2)
    private BigDecimal technicalScore;

    @Column(name = "communication_score", precision = 5, scale = 2)
    private BigDecimal communicationScore;

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private BigDecimal confidenceScore;

    @Column(name = "problem_solving_score", precision = 5, scale = 2)
    private BigDecimal problemSolvingScore;

    @Column(name = "clarity_score", precision = 5, scale = 2)
    private BigDecimal clarityScore;

    @Column(name = "interview_score", precision = 5, scale = 2)
    private BigDecimal interviewScore;

    @Column(name = "cv_score", precision = 5, scale = 2)
    private BigDecimal cvScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "scoring_breakdown", columnDefinition = "jsonb")
    private Map<String, Object> scoringBreakdown;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "strengths", columnDefinition = "jsonb")
    private List<String> strengths;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "weaknesses", columnDefinition = "jsonb")
    private List<String> weaknesses;

    @Column(name = "summary_text", columnDefinition = "text")
    private String summaryText;

    @Column(name = "next_steps", columnDefinition = "text")
    private String nextSteps;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "retry_of_session_id")
    private UUID retryOfSessionId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
