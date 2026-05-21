package com.aiinterview.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobGroupRequest {
    @NotBlank(message = "Group name is required")
    private String name;
    
    private String description;
    
    @Builder.Default
    private boolean isActive = true;
}
