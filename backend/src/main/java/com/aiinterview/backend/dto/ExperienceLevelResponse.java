package com.aiinterview.backend.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceLevelResponse {

    private Integer id;
    private String code;
    private String name;
    private String description;
    private BigDecimal minYears;
    private BigDecimal maxYears;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
