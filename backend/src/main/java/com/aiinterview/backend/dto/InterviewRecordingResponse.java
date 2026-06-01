package com.aiinterview.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRecordingResponse {
    private UUID id;
    private UUID sessionId;
    private UUID questionId;
    private UUID answerId;
    private String recordingType;
    private String provider;
    private String bucketName;
    private String filePath;
    private String publicUrl;
    private String mimeType;
    private Long fileSize;
    private Integer durationSeconds;
    private String transcriptText;
    private String processingStatus;
    private LocalDateTime createdAt;
}
