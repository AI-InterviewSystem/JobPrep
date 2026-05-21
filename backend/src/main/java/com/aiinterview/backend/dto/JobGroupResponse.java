package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobGroupResponse {
    private UUID id;
    private String name;
    private String description;
    private boolean isActive;
    private List<JobCategoryResponse> categories;
}
