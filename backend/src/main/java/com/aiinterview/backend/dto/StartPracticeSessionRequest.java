package com.aiinterview.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StartPracticeSessionRequest {
    private Integer topicId;
    private Integer questionId;
    private String role;
    private String level;
    private Integer totalQuestions;
}
