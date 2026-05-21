package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.InterviewAnswer.InputType;
import lombok.Data;
import java.util.UUID;

@Data
public class SubmitAnswerRequest {
    private UUID questionId;
    private String answerText;
    private InputType inputType;
    private Integer durationSeconds;
}
