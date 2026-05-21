package com.aiinterview.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobCategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    private String description;
    private java.util.UUID groupId;
}
