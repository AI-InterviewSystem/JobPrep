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
    private String title;
    private String interviewType;
    private String roleSnapshot;
    private String levelSnapshot;
    private Integer totalQuestions;
    private Integer completedQuestions;
    private Integer durationSeconds;
    private BigDecimal overallScore;
    private BigDecimal technicalScore;
    private BigDecimal communicationScore;
    private BigDecimal confidenceScore;
    private BigDecimal problemSolvingScore;
    private BigDecimal clarityScore;
    private List<String> strengths;
    private List<String> weaknesses;
    private String summaryText;
    private String nextSteps;
    private String aiStatus;
    private String aiMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<InterviewQuestionResponse> questions;
}
