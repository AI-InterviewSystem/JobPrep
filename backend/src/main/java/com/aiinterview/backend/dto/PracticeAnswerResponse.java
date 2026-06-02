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
public class PracticeAnswerResponse {
    private UUID id;
    private UUID practiceSessionId;
    private Integer questionId;
    private String answerText;
    private String inputType;
    private BigDecimal score;
    private String feedbackSummary;
    private List<String> suggestedImprovements;
    private LocalDateTime answeredAt;
}
