package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private Statistics stats;
    private List<ChartDataPoint> revenueChart;
    private List<ChartDataPoint> userGrowthChart;
    private Ga4Analytics ga4Analytics;
    private List<TopProduct> topProducts;
    private List<RecentCustomer> recentCustomers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Statistics {
        private BigDecimal totalRevenue;
        private double revenueGrowth;
        private long totalUsers;
        private double userGrowth;
        private long totalInterviewSessions;
        private long totalQuestions;
        private long totalSubscriptions;
        private long activeSubscriptions;
        private BigDecimal averageInterviewScore;
        private BigDecimal avgRevenuePerOrder;
        private double avgRevenueGrowth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChartDataPoint {
        private String label;
        private Double value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Ga4Analytics {
        private boolean configured;
        private String statusMessage;
        private String measurementId;
        private String propertyId;
        private Long realtimeActiveUsers;
        private Long activeUsers;
        private Long totalUsers;
        private Long sessions;
        private Long pageViews;
        private Double engagementRate;
        private Double bounceRate;
        private Double averageSessionDuration;
        private List<ChartDataPoint> dailyActiveUsers;
        private List<TopPage> topPages;
        private List<TrafficSource> trafficSources;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopPage {
        private String title;
        private String path;
        private long views;
        private long activeUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrafficSource {
        private String source;
        private long sessions;
        private long totalUsers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private String name;
        private long orders;
        private BigDecimal revenue;
        private String price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentCustomer {
        private String id;
        private String name;
        private String email;
        private String location;
        private String avatar;
        private String createdAt;
    }
}

