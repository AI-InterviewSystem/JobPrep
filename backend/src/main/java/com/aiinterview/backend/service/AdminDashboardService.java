package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.AdminDashboardResponse;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.PaymentRepository;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

        private final UserRepository userRepository;
        private final PaymentRepository paymentRepository;

        public AdminDashboardResponse getDashboardStats() {
                LocalDateTime now = LocalDateTime.now();
                LocalDateTime thirtyDaysAgo = now.minusDays(30);
                LocalDateTime sixtyDaysAgo = now.minusDays(60);

                // Current period stats
                BigDecimal currentRevenue = paymentRepository.sumRevenueSince(thirtyDaysAgo);
                if (currentRevenue == null)
                        currentRevenue = BigDecimal.ZERO;

                long currentUsers = userRepository.countNewUsersSince(thirtyDaysAgo);
                long currentTransactions = paymentRepository.countTransactionsSince(thirtyDaysAgo);

                BigDecimal currentAvgRevenue = currentTransactions > 0
                                ? currentRevenue.divide(BigDecimal.valueOf(currentTransactions), 2,
                                                RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                // Previous period stats (for growth calculation)
                // Note: sumRevenueSince returns sum from that date to NOW.
                // To get exactly 60-30 days ago, we'd need a more specific query.
                // For simplicity, let's assume sumRevenueSince(startDate) -
                // sumRevenueSince(endDate)
                BigDecimal totalSinceSixty = paymentRepository.sumRevenueSince(sixtyDaysAgo);
                if (totalSinceSixty == null)
                        totalSinceSixty = BigDecimal.ZERO;
                BigDecimal previousRevenue = totalSinceSixty.subtract(currentRevenue);

                long totalUsersSinceSixty = userRepository.countNewUsersSince(sixtyDaysAgo);
                long previousUsers = totalUsersSinceSixty - currentUsers;

                // Growth calculations
                double revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
                double userGrowth = calculateGrowth(BigDecimal.valueOf(currentUsers),
                                BigDecimal.valueOf(previousUsers));

                // Total stats
                long totalUsersCount = userRepository.count();
                BigDecimal totalRevenueOverall = paymentRepository.sumRevenueSince(LocalDateTime.of(2000, 1, 1, 0, 0));
                if (totalRevenueOverall == null)
                        totalRevenueOverall = BigDecimal.ZERO;

                // Charts
                List<AdminDashboardResponse.ChartDataPoint> revenueChart = paymentRepository
                                .sumRevenueByDay(thirtyDaysAgo)
                                .stream()
                                .map(obj -> new AdminDashboardResponse.ChartDataPoint(obj[0].toString(),
                                                ((BigDecimal) obj[1]).doubleValue()))
                                .collect(Collectors.toList());

                List<AdminDashboardResponse.ChartDataPoint> userGrowthChart = userRepository
                                .countNewUsersByDay(thirtyDaysAgo)
                                .stream()
                                .map(obj -> new AdminDashboardResponse.ChartDataPoint(obj[0].toString(),
                                                ((Long) obj[1]).doubleValue()))
                                .collect(Collectors.toList());

                // Top Products
                List<AdminDashboardResponse.TopProduct> topProducts = paymentRepository.getTopSellingProducts()
                                .stream()
                                .limit(5)
                                .map(obj -> AdminDashboardResponse.TopProduct.builder()
                                                .name(obj[0] != null ? obj[0].toString() : "Unknown")
                                                .orders((Long) obj[1])
                                                .revenue((BigDecimal) obj[2])
                                                .build())
                                .collect(Collectors.toList());

                // Recent Customers
                List<AdminDashboardResponse.RecentCustomer> recentCustomers = userRepository
                                .findTop5ByOrderByCreatedAtDesc()
                                .stream()
                                .map(user -> AdminDashboardResponse.RecentCustomer.builder()
                                                .id(user.getId().toString())
                                                .name(user.getProfile() != null ? user.getProfile().getFullName()
                                                                : "New User")
                                                .email(user.getEmail())
                                                .avatar(user.getProfile() != null ? user.getProfile().getAvatarUrl()
                                                                : null)
                                                .createdAt(user.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME))
                                                .location("Unknown")
                                                .build())
                                .collect(Collectors.toList());

                return AdminDashboardResponse.builder()
                                .stats(AdminDashboardResponse.Statistics.builder()
                                                .totalRevenue(totalRevenueOverall)
                                                .revenueGrowth(revenueGrowth)
                                                .totalUsers(totalUsersCount)
                                                .userGrowth(userGrowth)
                                                .avgRevenuePerOrder(currentAvgRevenue)
                                                .avgRevenueGrowth(0.0)
                                                .build())
                                .revenueChart(revenueChart)
                                .userGrowthChart(userGrowthChart)
                                .topProducts(topProducts)
                                .recentCustomers(recentCustomers)
                                .build();
        }

        private double calculateGrowth(BigDecimal current, BigDecimal previous) {
                if (previous.compareTo(BigDecimal.ZERO) == 0) {
                        return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
                }
                return current.subtract(previous)
                                .divide(previous, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue();
        }
}
