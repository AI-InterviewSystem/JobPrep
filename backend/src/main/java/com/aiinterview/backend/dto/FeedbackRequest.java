package com.aiinterview.backend.dto;

import com.aiinterview.backend.entity.Feedback;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FeedbackRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String attachmentUrl;

    private Feedback.FeedbackType type;
}
