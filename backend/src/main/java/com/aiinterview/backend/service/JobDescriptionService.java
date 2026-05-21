package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.JobDescriptionRequest;
import com.aiinterview.backend.dto.JobDescriptionResponse;
import com.aiinterview.backend.entity.JobCategory;
import com.aiinterview.backend.entity.JobDescription;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.JobCategoryRepository;
import com.aiinterview.backend.repository.JobDescriptionRepository;
import com.aiinterview.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobDescriptionService {

    private final JobDescriptionRepository jobDescriptionRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public JobDescriptionResponse create(JobDescriptionRequest request, UUID userId) {
        JobCategory category = null;
        if (request.getJobCategoryId() != null) {
            category = jobCategoryRepository.findById(request.getJobCategoryId())
                    .orElseThrow(() -> new AppException("Job category not found"));
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException("User not found"));
        }

        String keyRequirementsJson = "[]";
        if (request.getKeyRequirements() != null) {
            try {
                keyRequirementsJson = objectMapper.writeValueAsString(request.getKeyRequirements());
            } catch (Exception e) {
                log.error("Failed to serialize key requirements to JSON", e);
            }
        }

        JobDescription jobDescription = JobDescription.builder()
                .category(category)
                .jobDescriptionText(request.getJobDescriptionText())
                .keyRequirements(keyRequirementsJson)
                .createdBy(user)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .build();

        JobDescription saved = jobDescriptionRepository.save(jobDescription);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<JobDescriptionResponse> getJobDescriptions(UUID userId) {
        List<JobDescription> list;
        if (userId != null) {
            list = jobDescriptionRepository.findByCreatedByIdOrIsPublicTrueOrderByCreatedAtDesc(userId);
        } else {
            list = jobDescriptionRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobDescriptionResponse getById(UUID id, UUID userId) {
        JobDescription jd = jobDescriptionRepository.findById(id)
                .orElseThrow(() -> new AppException("Job description not found"));

        if (Boolean.FALSE.equals(jd.getIsPublic())) {
            if (jd.getCreatedBy() == null || userId == null || !jd.getCreatedBy().getId().equals(userId)) {
                throw new AppException("Access denied to private job description");
            }
        }

        return mapToResponse(jd);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        JobDescription jd = jobDescriptionRepository.findById(id)
                .orElseThrow(() -> new AppException("Job description not found"));

        if (jd.getCreatedBy() == null || userId == null || !jd.getCreatedBy().getId().equals(userId)) {
            throw new AppException("Access denied. Only the creator can delete this job description.");
        }

        jobDescriptionRepository.delete(jd);
    }

    private JobDescriptionResponse mapToResponse(JobDescription jd) {
        List<String> keyReqs = new ArrayList<>();
        if (jd.getKeyRequirements() != null) {
            try {
                keyReqs = objectMapper.readValue(jd.getKeyRequirements(), new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.error("Failed to deserialize key requirements from JSON", e);
            }
        }

        return JobDescriptionResponse.builder()
                .id(jd.getId())
                .jobCategoryId(jd.getCategory() != null ? jd.getCategory().getId() : null)
                .jobCategoryName(jd.getCategory() != null ? jd.getCategory().getName() : null)
                .jobDescriptionText(jd.getJobDescriptionText())
                .keyRequirements(keyReqs)
                .createdBy(jd.getCreatedBy() != null ? jd.getCreatedBy().getId() : null)
                .isPublic(jd.getIsPublic())
                .createdAt(jd.getCreatedAt())
                .build();
    }
}
