package com.aiinterview.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRoleResponse {
    private UUID id;
    private UUID jobCategoryId;
    private String jobCategoryName;
    private UUID jobGroupId;
    private String jobGroupName;
    private String name;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
