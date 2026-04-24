package com.aiinterview.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
        regexp = "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*#?&]).{8,}$",
        message = "Password must be at least 8 characters long and contain at least one letter, one number, and one special character"
    )
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;
}
