package com.aiinterview.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBankResponse {
    private Integer id;
    private UUID jobGroupId;
    private String jobGroupName;
    private UUID jobCategoryId;
    private String jobCategoryName;
    private UUID jobRoleId;
    private String jobRoleName;
    private String questionText;
    private String difficulty;
    private String questionType;
    private Integer suggestedDuration;
    private List<String> tags;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
