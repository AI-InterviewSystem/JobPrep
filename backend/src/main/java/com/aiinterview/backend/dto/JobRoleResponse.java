package com.aiinterview.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobRoleResponse {
    private UUID id;
    private String name;
    private String description;
    private UUID categoryId;
}
