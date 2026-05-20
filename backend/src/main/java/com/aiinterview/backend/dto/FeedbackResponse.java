package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.Feedback;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FeedbackResponse {
    private UUID id;
    private String title;
    private String content;
    private String attachmentUrl;
    private Feedback.Status status;
    private Feedback.FeedbackType type;

    // User info (useful for Admin view)
    private String userEmail;
    private String userName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
