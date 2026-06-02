package com.aiinterview.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSessionResponse {
    private UUID id;
    private Integer topicId;
    private String topicName;
    private String role;
    private String level;
    private String status;
    private Integer totalQuestions;
    private Integer completedQuestions;
    private BigDecimal overallScore;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<QuestionBankResponse> questions;
}
