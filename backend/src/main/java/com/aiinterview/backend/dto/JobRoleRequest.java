package com.aiinterview.backend.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRoleRequest {
    private UUID jobCategoryId;
    private String name;
    private String description;
    private Boolean isActive;
}
