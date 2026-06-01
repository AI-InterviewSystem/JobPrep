package com.aiinterview.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobGroupRequest {
    private String name;
    private String description;
    private Boolean isActive;
}
