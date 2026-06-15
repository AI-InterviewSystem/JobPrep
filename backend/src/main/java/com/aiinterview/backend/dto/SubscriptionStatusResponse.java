package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatusResponse {
    private String planName;
    private String status;
    private LocalDateTime currentPeriodEnd;
    private Boolean cancelAtPeriodEnd;
    private Integer remainingInterviews; // Remaining for current cycle or total limits
    
    // Usage info
    private Integer mockInterviewsLimit; // Limit per month or per cycle (e.g., 2, 5, or -1)
    private Integer mockInterviewsUsed;
    private Integer practiceQuestionsLimit; // Limit per month (e.g., 10 or -1)
    private Integer practiceQuestionsUsed;
}
