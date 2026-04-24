package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.ChangePasswordRequest;
import com.aiinterview.backend.dto.ProfileDto;
import com.aiinterview.backend.dto.UpdateProfileRequest;
import com.aiinterview.backend.service.ProfileService;
import com.aiinterview.backend.service.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getId()));
    }

    @PutMapping
    public ResponseEntity<ProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProfile(principal.getId(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(principal.getId(), request);
        return ResponseEntity.ok("Password changed successfully");
    }
}
