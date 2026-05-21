package com.aiinterview.backend.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienceLevelRequest {

    private String code;
    private String name;
    private String description;
    private BigDecimal minYears;
    private BigDecimal maxYears;
    private Integer displayOrder;
    private Boolean isActive;
}
