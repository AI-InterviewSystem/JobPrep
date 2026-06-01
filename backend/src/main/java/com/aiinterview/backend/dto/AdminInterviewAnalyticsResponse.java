package com.aiinterview.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminInterviewAnalyticsResponse {
    private long totalSessions;
    private long completedSessions;
    private long inProgressSessions;
    private long abandonedSessions;
    private BigDecimal averageScore;
    private double completionRate;
    private double abandonmentRate;
    private List<LabelCount> popularRoles;
    private List<LabelCount> weakTopics;
    private List<ChartPoint> sessionsByDay;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LabelCount {
        private String label;
        private long count;
        private BigDecimal value;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartPoint {
        private String label;
        private BigDecimal value;
    }
}
