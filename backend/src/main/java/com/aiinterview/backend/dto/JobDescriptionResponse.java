package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionResponse {
    private UUID id;
    private UUID jobCategoryId;
    private String jobCategoryName;
    private String jobDescriptionText;
    private List<String> keyRequirements;
    private UUID createdBy;
    private Boolean isPublic;
    private LocalDateTime createdAt;
}
