package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.VerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationOtpRepository extends JpaRepository<VerificationOtp, Long> {
    Optional<VerificationOtp> findByUser(User user);
    Optional<VerificationOtp> findByOtpCodeAndUserEmail(String otpCode, String email);
    void deleteByUser(User user);
}
