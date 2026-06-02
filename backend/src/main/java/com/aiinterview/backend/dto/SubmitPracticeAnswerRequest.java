package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.InterviewAnswer.InputType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitPracticeAnswerRequest {
    private Integer questionId;
    private String answerText;
    private String audioStoragePath;
    private InputType inputType;
}
