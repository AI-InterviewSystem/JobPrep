package com.aiinterview.backend.dto;

import lombok.Data;

@Data
public class NotificationPreferenceRequest {
    private Boolean practiceReminders;
    private Boolean subscriptionAlerts;
    private Boolean learningSuggestions;
}
