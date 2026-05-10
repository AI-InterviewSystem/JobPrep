package com.aiinterview.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminUserPageResponse {
    private List<AdminUserResponse> users;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
