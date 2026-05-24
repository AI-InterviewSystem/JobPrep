package com.aiinterview.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class CvParsedDataResponse {
    private String parseStatus;
    private Map<String, Object> cvData;
}
