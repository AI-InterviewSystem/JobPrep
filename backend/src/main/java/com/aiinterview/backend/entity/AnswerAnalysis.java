package com.aiinterview.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "answer_analysis")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerAnalysis {

    @Id
    @Column(name = "answer_id")
    private UUID answerId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "answer_id")
    private InterviewAnswer answer;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "clarity_score", precision = 5, scale = 2)
    private BigDecimal clarityScore;

    @Column(name = "relevance_score", precision = 5, scale = 2)
    private BigDecimal relevanceScore;

    @Column(name = "feedback_summary", columnDefinition = "text")
    private String feedbackSummary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "suggested_improvements", columnDefinition = "jsonb")
    private List<String> suggestedImprovements;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "strengths", columnDefinition = "jsonb")
    private List<String> strengths;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "weaknesses", columnDefinition = "jsonb")
    private List<String> weaknesses;

    @Column(name = "improved_answer", columnDefinition = "text")
    private String improvedAnswer;

    @Column(name = "is_answer_relevant")
    private Boolean isAnswerRelevant;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "prompt_version", length = 50)
    private String promptVersion;

    @Column(name = "latency_ms")
    private Integer latencyMs;

    @CreationTimestamp
    @Column(name = "analyzed_at", updatable = false)
    private LocalDateTime analyzedAt;
}
