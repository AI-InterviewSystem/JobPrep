package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByUserEmailOrderByCreatedAtDesc(String email);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = com.aiinterview.backend.entity.Payment.Status.PAID AND p.paidAt >= :startDate")
    BigDecimal sumRevenueSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = com.aiinterview.backend.entity.Payment.Status.PAID AND p.paidAt >= :startDate")
    long countTransactionsSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT CAST(p.paidAt AS date) as date, SUM(p.amount) as total FROM Payment p WHERE p.status = com.aiinterview.backend.entity.Payment.Status.PAID AND p.paidAt >= :startDate GROUP BY CAST(p.paidAt AS date) ORDER BY CAST(p.paidAt AS date)")
    List<Object[]> sumRevenueByDay(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT p.subscription.plan.name, COUNT(p), SUM(p.amount) FROM Payment p WHERE p.status = com.aiinterview.backend.entity.Payment.Status.PAID GROUP BY p.subscription.plan.name ORDER BY SUM(p.amount) DESC")
    List<Object[]> getTopSellingProducts();
}
