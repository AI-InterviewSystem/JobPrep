package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countNewUsersSince(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT CAST(u.createdAt AS date) as date, COUNT(u) as count FROM User u WHERE u.createdAt >= :startDate GROUP BY CAST(u.createdAt AS date) ORDER BY CAST(u.createdAt AS date)")
    List<Object[]> countNewUsersByDay(@Param("startDate") LocalDateTime startDate);

    List<User> findTop5ByOrderByCreatedAtDesc();

    // Admin: search by email + filter by isBanned
    @Query("SELECT u FROM User u WHERE " +
           "(:email = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:isBanned IS NULL OR COALESCE(u.isBanned, false) = :isBanned) AND " +
           "u.role != 'ADMIN'")
    Page<User> findAllNonAdminUsers(
            @Param("email") String email,
            @Param("isBanned") Boolean isBanned,
            Pageable pageable);
}
