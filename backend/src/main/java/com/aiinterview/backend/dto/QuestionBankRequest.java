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
    private Integer topicId;
    private String questionText;
    private String difficulty;
    private String role;
    private String level;
    private String questionType;
    private String sampleAnswer;
    private String explanation;
    private Integer suggestedDuration;
    private List<String> tags;
    private Boolean isActive;
}
