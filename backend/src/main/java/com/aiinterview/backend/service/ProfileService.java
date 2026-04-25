package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.ChangePasswordRequest;
import com.aiinterview.backend.dto.ProfileDto;
import com.aiinterview.backend.dto.UpdateProfileRequest;
import com.aiinterview.backend.entity.Profile;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.ProfileRepository;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileDto getProfile(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new AppException("Profile not found"));
        
        User user = profile.getUser();

        return ProfileDto.builder()
                .userId(userId)
                .email(user.getEmail())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .avatarUrl(profile.getAvatarUrl())
                .timezone(profile.getTimezone())
                .emailVerified(user.getEmailVerified())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public ProfileDto updateProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new AppException("Profile not found"));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getTimezone() != null) profile.setTimezone(request.getTimezone());

        profileRepository.save(profile);

        return getProfile(userId);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new AppException("Invalid old password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
