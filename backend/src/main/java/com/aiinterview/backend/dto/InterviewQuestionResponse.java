package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.QuestionSource;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestionResponse {
    private UUID id;
    private String questionText;
    private QuestionSource questionSource;
    private String jobRequirementTag;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private InterviewAnswerResponse answer;
    private List<InterviewRecordingResponse> recordings;
}
