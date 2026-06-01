package com.aiinterview.backend.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCategoryRequest {
    private UUID jobGroupId;
    private String name;
    private String description;
    private Boolean isActive;
}
