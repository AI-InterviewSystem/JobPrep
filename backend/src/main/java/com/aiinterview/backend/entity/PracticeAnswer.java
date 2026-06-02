package com.aiinterview.backend.entity;

import com.aiinterview.backend.entity.InterviewAnswer.InputType;
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
@Table(name = "practice_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "practice_session_id", nullable = false)
    private PracticeSession practiceSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuestionBank question;

    @Column(name = "answer_text", columnDefinition = "text")
    private String answerText;

    @Column(name = "audio_storage_path", columnDefinition = "text")
    private String audioStoragePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_type")
    private InputType inputType;

    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "feedback_summary", columnDefinition = "text")
    private String feedbackSummary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "suggested_improvements", columnDefinition = "jsonb")
    private List<String> suggestedImprovements;

    @CreationTimestamp
    @Column(name = "answered_at", updatable = false)
    private LocalDateTime answeredAt;
}
