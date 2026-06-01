package com.aiinterview.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReportsResponse {
    private List<AdminInterviewAnalyticsResponse.ChartPoint> userGrowth;
    private List<AdminInterviewAnalyticsResponse.ChartPoint> interviewUsage;
    private List<AdminInterviewAnalyticsResponse.ChartPoint> revenue;
    private List<AdminInterviewAnalyticsResponse.LabelCount> subscriptionPerformance;
    private List<AdminInterviewAnalyticsResponse.LabelCount> questionUsage;
    private List<AdminInterviewAnalyticsResponse.LabelCount> lowScoreQuestions;
    private List<AdminInterviewAnalyticsResponse.LabelCount> weakTopics;
    private List<AdminInterviewAnalyticsResponse.ChartPoint> progressTrend;
    private long activeUsers30d;
    private long returningUsers30d;
    private long activeSubscriptions;
    private long expiringSubscriptions7d;
    private long cancelledSubscriptions;
    private BigDecimal totalRevenue;
}
