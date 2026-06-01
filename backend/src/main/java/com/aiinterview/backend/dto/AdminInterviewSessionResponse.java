package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.InterviewSession.InterviewStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminInterviewSessionResponse {
    private UUID id;
    private UUID userId;
    private String candidateEmail;
    private String candidateName;
    private String title;
    private InterviewStatus status;
    private String roleSnapshot;
    private String levelSnapshot;
    private String interviewType;
    private BigDecimal overallScore;
    private Integer totalQuestions;
    private Integer completedQuestions;
    private Integer durationSeconds;
    private LocalDateTime createdAt;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
