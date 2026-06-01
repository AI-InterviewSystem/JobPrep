package com.aiinterview.backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CreateInterviewSessionRequest {
    private UUID jobDescriptionId;
    private String title;
    private String roleSnapshot;
    private UUID retryOfSessionId;
    // We could pass CV id here if we need, but for now we just map JD.
    // If you're doing custom JD, jdId is passed.
}
