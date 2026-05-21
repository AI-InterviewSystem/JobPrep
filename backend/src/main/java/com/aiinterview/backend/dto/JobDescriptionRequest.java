package com.aiinterview.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class JobDescriptionRequest {

    private UUID jobCategoryId;

    @NotBlank(message = "Job description text is required")
    private String jobDescriptionText;

    private List<String> keyRequirements;

    private Boolean isPublic;
}
