package com.aiinterview.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class JobDescriptionRequest {

    @NotBlank(message = "Job description text is required")
    private String jobDescriptionText;

    private List<String> keyRequirements;

    private Boolean isPublic;
}
