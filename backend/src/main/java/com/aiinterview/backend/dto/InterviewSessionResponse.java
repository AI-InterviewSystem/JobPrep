package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.InterviewSession.InterviewStatus;
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
public class InterviewSessionResponse {
    private UUID id;
    private InterviewStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal overallScore;
    private List<String> strengths;
    private List<String> weaknesses;
    private String summaryText;
    private String nextSteps;
    private String aiStatus;
    private String aiMessage;
    private LocalDateTime createdAt;
    private List<InterviewQuestionResponse> questions;
}
