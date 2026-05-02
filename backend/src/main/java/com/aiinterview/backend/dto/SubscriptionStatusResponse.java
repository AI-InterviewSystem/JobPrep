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
    private Integer remainingInterviews;
}
