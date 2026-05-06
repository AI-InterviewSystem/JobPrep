package com.aiinterview.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * If true, generate a long-lived token (30 days).
     * If false or null, generate a standard token (24 hours).
     */
    private Boolean rememberMe;
}
