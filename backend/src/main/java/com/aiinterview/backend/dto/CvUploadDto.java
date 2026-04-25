package com.aiinterview.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CvUploadDto {
    private UUID id;
    private String fileName;
    private String storagePath;
    private Integer fileSize;
    private String mimeType;
    private Boolean isCurrent;
    private String parseStatus;
    private LocalDateTime createdAt;
}
