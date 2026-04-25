package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.entity.PasswordResetToken;
import com.aiinterview.backend.entity.Profile;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.VerificationOtp;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.PasswordResetTokenRepository;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.repository.VerificationOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final VerificationOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found with email: " + request.getEmail()));

        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build();

        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendEmail(user.getEmail(), "Password Reset Request", 
                "Click the link below to reset your password:\n" + resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new AppException("Invalid or expired token"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new AppException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenRepository.delete(resetToken);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already exists");
        }

        // Password validation: ≥ 8 characters, at least 1 letter, 1 number, 1 special character
        String password = request.getPassword();
        if (password == null || password.length() < 8 || 
            !password.matches(".*[a-zA-Z].*") || 
            !password.matches(".*\\d.*") || 
            !password.matches(".*[@$!%*#?&].*")) {
            throw new AppException("Password must be at least 8 characters long and contain at least one letter, one number, and one special character");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(password))
                .emailVerified(false)
                .isActive(false) // Deactivated until OTP is verified
                .isBanned(false)
                .build();

        Profile profile = Profile.builder()
                .user(user)
                .fullName(request.getFullName())
                .build();
        
        user.setProfile(profile);

        User savedUser = userRepository.save(user);

        // Generate and send OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        VerificationOtp verificationOtp = VerificationOtp.builder()
                .otpCode(otp)
                .user(savedUser)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();
        
        otpRepository.save(verificationOtp);

        emailService.sendEmail(savedUser.getEmail(), "Account Verification Code", 
                "Your verification code is: " + otp + "\nThis code will expire in 15 minutes.");

        return AuthResponse.builder()
                .user(AuthResponse.UserDto.builder()
                        .id(savedUser.getId())
                        .email(savedUser.getEmail())
                        .emailVerified(savedUser.getEmailVerified())
                        .role(savedUser.getRole())
                        .build())
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        VerificationOtp otp = otpRepository.findByOtpCodeAndUserEmail(request.getOtpCode(), request.getEmail())
                .orElseThrow(() -> new AppException("Invalid OTP code"));

        if (otp.isExpired()) {
            otpRepository.delete(otp);
            throw new AppException("OTP has expired");
        }

        User user = otp.getUser();
        user.setEmailVerified(true);
        user.setIsActive(true);
        userRepository.save(user);

        otpRepository.delete(otp);

        var userPrincipal = new UserPrincipal(user);
        String token = jwtService.generateToken(userPrincipal);

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .emailVerified(user.getEmailVerified())
                        .role(user.getRole())
                        .build())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User not found"));
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        var userPrincipal = new UserPrincipal(user);
        String token = jwtService.generateToken(userPrincipal);

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .emailVerified(user.getEmailVerified())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
