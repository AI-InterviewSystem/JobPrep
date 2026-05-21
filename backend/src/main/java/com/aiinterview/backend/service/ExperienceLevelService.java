package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.ExperienceLevelRequest;
import com.aiinterview.backend.dto.ExperienceLevelResponse;
import com.aiinterview.backend.entity.AdminAction;
import com.aiinterview.backend.entity.ExperienceLevel;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.AdminActionRepository;
import com.aiinterview.backend.repository.ExperienceLevelRepository;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExperienceLevelService {

    private final ExperienceLevelRepository experienceLevelRepository;
    private final AdminActionRepository adminActionRepository;
    private final UserRepository userRepository;

    private void logAdminAction(String actionType, String reason) {
        String adminEmail = "system";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            adminEmail = auth.getName();
        }
        try {
            final String email = adminEmail;
            userRepository.findByEmail(email).ifPresent(admin -> {
                AdminAction action = AdminAction.builder()
                        .adminUser(admin)
                        .actionType(actionType)
                        .reason(reason)
                        .build();
                adminActionRepository.save(action);
            });
        } catch (Exception e) {
            // Ignore logging errors
        }
    }

    @Transactional(readOnly = true)
    public List<ExperienceLevelResponse> getActivelevels() {
        return experienceLevelRepository.findAllByIsActiveTrueOrderByDisplayOrderAsc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperienceLevelResponse> getAllLevels() {
        return experienceLevelRepository.findAllByOrderByDisplayOrderAsc()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExperienceLevelResponse getLevelById(Integer id) {
        return experienceLevelRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new AppException("Experience level not found"));
    }

    @Transactional
    public ExperienceLevelResponse createLevel(ExperienceLevelRequest request) {
        if (experienceLevelRepository.existsByCode(request.getCode())) {
            throw new AppException("Experience level code already exists");
        }

        ExperienceLevel level = ExperienceLevel.builder()
                .code(request.getCode().toUpperCase())
                .name(request.getName())
                .description(request.getDescription())
                .minYears(request.getMinYears())
                .maxYears(request.getMaxYears())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        ExperienceLevel saved = experienceLevelRepository.save(level);
        logAdminAction("CREATE_EXPERIENCE_LEVEL", "Created experience level: " + saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public ExperienceLevelResponse updateLevel(Integer id, ExperienceLevelRequest request) {
        ExperienceLevel level = experienceLevelRepository.findById(id)
                .orElseThrow(() -> new AppException("Experience level not found"));

        // Check code uniqueness only if changed
        if (!level.getCode().equalsIgnoreCase(request.getCode()) &&
                experienceLevelRepository.existsByCode(request.getCode())) {
            throw new AppException("Experience level code already exists");
        }

        level.setCode(request.getCode().toUpperCase());
        level.setName(request.getName());
        level.setDescription(request.getDescription());
        level.setMinYears(request.getMinYears());
        level.setMaxYears(request.getMaxYears());
        if (request.getDisplayOrder() != null) level.setDisplayOrder(request.getDisplayOrder());
        if (request.getIsActive() != null) level.setIsActive(request.getIsActive());

        ExperienceLevel saved = experienceLevelRepository.save(level);
        logAdminAction("UPDATE_EXPERIENCE_LEVEL", "Updated experience level: " + saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteLevel(Integer id) {
        ExperienceLevel level = experienceLevelRepository.findById(id)
                .orElseThrow(() -> new AppException("Experience level not found"));
        String name = level.getName();
        experienceLevelRepository.delete(level);
        logAdminAction("DELETE_EXPERIENCE_LEVEL", "Deleted experience level: " + name);
    }

    private ExperienceLevelResponse mapToResponse(ExperienceLevel level) {
        return ExperienceLevelResponse.builder()
                .id(level.getId())
                .code(level.getCode())
                .name(level.getName())
                .description(level.getDescription())
                .minYears(level.getMinYears())
                .maxYears(level.getMaxYears())
                .displayOrder(level.getDisplayOrder())
                .isActive(level.getIsActive())
                .createdAt(level.getCreatedAt())
                .updatedAt(level.getUpdatedAt())
                .build();
    }
}
