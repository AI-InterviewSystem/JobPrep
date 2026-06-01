package com.aiinterview.backend.dto;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBankRequest {
    private UUID jobCategoryId;
    private UUID jobRoleId;
    private String questionText;
    private String difficulty;
    private String questionType;
    private Integer suggestedDuration;
    private List<String> tags;
    private Boolean isActive;
}
