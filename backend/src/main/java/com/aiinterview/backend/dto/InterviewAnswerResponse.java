package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.InterviewAnswer.InputType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswerResponse {
    private UUID id;
    private UUID questionId;
    private String answerText;
    private String audioStoragePath;
    private Integer durationSeconds;
    private InputType inputType;
    private Integer score;
    private String feedback;
    private List<String> strengths;
    private List<String> weaknesses;
    private String improvedAnswer;
    private Boolean isAnswerRelevant;
    private LocalDateTime createdAt;
}
