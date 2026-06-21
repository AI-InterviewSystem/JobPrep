package com.aiinterview.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuestionBankPageResponse {
    private List<QuestionBankResponse> questions;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
