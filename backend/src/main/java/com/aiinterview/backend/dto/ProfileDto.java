package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto {
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String timezone;
    private Boolean emailVerified;
}
