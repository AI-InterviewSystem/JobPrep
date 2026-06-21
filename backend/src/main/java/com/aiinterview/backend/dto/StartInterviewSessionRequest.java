package com.aiinterview.backend.dto;

import lombok.Data;

@Data
public class StartInterviewSessionRequest {
    private String interviewType;
    private String interviewLevel;
    private String interviewLanguage;
    private Integer numQuestions;
}
