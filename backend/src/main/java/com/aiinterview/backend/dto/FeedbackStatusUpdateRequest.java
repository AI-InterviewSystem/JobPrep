package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.Feedback;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private Feedback.Status status;

    private String note;
}
