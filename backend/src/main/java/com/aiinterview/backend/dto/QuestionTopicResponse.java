package com.aiinterview.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionTopicResponse {
    private Integer id;
    private String name;
    private String description;
}
