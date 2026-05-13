package com.aiinterview.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class JobRoleRequest {
    @NotBlank(message = "Role name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Category ID is required")
    private UUID categoryId;
}
