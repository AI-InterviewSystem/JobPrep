package com.aiinterview.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "interview_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer {

    public enum InputType {
        TEXT,
        AUDIO,
        VIDEO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private InterviewQuestion question;

    @Column(name = "answer_text", columnDefinition = "text")
    private String answerText;

    @Column(name = "audio_storage_path", columnDefinition = "text")
    private String audioStoragePath;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_type")
    private InputType inputType;

    @Column(name = "score")
    private Integer score;

    @Column(name = "feedback", columnDefinition = "text")
    private String feedback;

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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
