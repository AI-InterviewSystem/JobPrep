package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.Feedback;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FeedbackHistoryResponse {
    private UUID id;
    private String changedByEmail;
    private String changedByName;
    private Feedback.Status oldStatus;
    private Feedback.Status newStatus;
    private String internalNote;
    private LocalDateTime createdAt;
}
