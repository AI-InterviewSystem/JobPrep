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
