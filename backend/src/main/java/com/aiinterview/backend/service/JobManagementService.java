package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.entity.JobCategory;
import com.aiinterview.backend.entity.JobGroup;
import com.aiinterview.backend.entity.JobRole;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.JobCategoryRepository;
import com.aiinterview.backend.repository.JobGroupRepository;
import com.aiinterview.backend.repository.JobRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobManagementService {

    private final JobGroupRepository jobGroupRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final JobRoleRepository jobRoleRepository;

    @Transactional(readOnly = true)
    public List<JobGroupResponse> getGroups() {
        return jobGroupRepository.findAllByOrderByNameAsc().stream().map(this::mapGroup).toList();
    }

    @Transactional
    public JobGroupResponse createGroup(JobGroupRequest request) {
        validateName(request.getName(), "Job group name is required");
        if (jobGroupRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new AppException("Job group already exists");
        }
        JobGroup group = JobGroup.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return mapGroup(jobGroupRepository.save(group));
    }

    @Transactional
    public JobGroupResponse updateGroup(UUID id, JobGroupRequest request) {
        validateName(request.getName(), "Job group name is required");
        JobGroup group = jobGroupRepository.findById(id).orElseThrow(() -> new AppException("Job group not found"));
        boolean nameChanged = !group.getName().equalsIgnoreCase(request.getName().trim());
        if (nameChanged && jobGroupRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new AppException("Job group already exists");
        }
        group.setName(request.getName().trim());
        group.setDescription(request.getDescription());
        if (request.getIsActive() != null) group.setIsActive(request.getIsActive());
        return mapGroup(jobGroupRepository.save(group));
    }

    @Transactional
    public void deleteGroup(UUID id) {
        JobGroup group = jobGroupRepository.findById(id).orElseThrow(() -> new AppException("Job group not found"));
        jobGroupRepository.delete(group);
    }

    @Transactional(readOnly = true)
    public List<JobCategoryResponse> getCategories(UUID groupId) {
        List<JobCategory> categories = groupId != null
                ? jobCategoryRepository.findAllByJobGroupIdOrderByNameAsc(groupId)
                : jobCategoryRepository.findAllByOrderByNameAsc();
        return categories.stream().map(this::mapCategory).toList();
    }

    @Transactional
    public JobCategoryResponse createCategory(JobCategoryRequest request) {
        validateName(request.getName(), "Job category name is required");
        if (request.getJobGroupId() == null) throw new AppException("Job group is required");
        JobGroup group = jobGroupRepository.findById(request.getJobGroupId())
                .orElseThrow(() -> new AppException("Job group not found"));
        if (jobCategoryRepository.existsByJobGroupIdAndNameIgnoreCase(group.getId(), request.getName().trim())) {
            throw new AppException("Job category already exists in this group");
        }
        JobCategory category = JobCategory.builder()
                .jobGroup(group)
                .name(request.getName().trim())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return mapCategory(jobCategoryRepository.save(category));
    }

    @Transactional
    public JobCategoryResponse updateCategory(UUID id, JobCategoryRequest request) {
        validateName(request.getName(), "Job category name is required");
        if (request.getJobGroupId() == null) throw new AppException("Job group is required");
        JobCategory category = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Job category not found"));
        JobGroup group = jobGroupRepository.findById(request.getJobGroupId())
                .orElseThrow(() -> new AppException("Job group not found"));
        boolean changed = !category.getName().equalsIgnoreCase(request.getName().trim())
                || !category.getJobGroup().getId().equals(group.getId());
        if (changed && jobCategoryRepository.existsByJobGroupIdAndNameIgnoreCase(group.getId(), request.getName().trim())) {
            throw new AppException("Job category already exists in this group");
        }
        category.setJobGroup(group);
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        if (request.getIsActive() != null) category.setIsActive(request.getIsActive());
        return mapCategory(jobCategoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        JobCategory category = jobCategoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Job category not found"));
        jobCategoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public List<JobRoleResponse> getRoles(UUID categoryId) {
        List<JobRole> roles = categoryId != null
                ? jobRoleRepository.findAllByJobCategoryIdOrderByNameAsc(categoryId)
                : jobRoleRepository.findAllByOrderByNameAsc();
        return roles.stream().map(this::mapRole).toList();
    }

    @Transactional
    public JobRoleResponse createRole(JobRoleRequest request) {
        validateName(request.getName(), "Job role name is required");
        if (request.getJobCategoryId() == null) throw new AppException("Job category is required");
        JobCategory category = jobCategoryRepository.findById(request.getJobCategoryId())
                .orElseThrow(() -> new AppException("Job category not found"));
        if (jobRoleRepository.existsByJobCategoryIdAndNameIgnoreCase(category.getId(), request.getName().trim())) {
            throw new AppException("Job role already exists in this category");
        }
        JobRole role = JobRole.builder()
                .jobCategory(category)
                .name(request.getName().trim())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        return mapRole(jobRoleRepository.save(role));
    }

    @Transactional
    public JobRoleResponse updateRole(UUID id, JobRoleRequest request) {
        validateName(request.getName(), "Job role name is required");
        if (request.getJobCategoryId() == null) throw new AppException("Job category is required");
        JobRole role = jobRoleRepository.findById(id).orElseThrow(() -> new AppException("Job role not found"));
        JobCategory category = jobCategoryRepository.findById(request.getJobCategoryId())
                .orElseThrow(() -> new AppException("Job category not found"));
        boolean changed = !role.getName().equalsIgnoreCase(request.getName().trim())
                || !role.getJobCategory().getId().equals(category.getId());
        if (changed && jobRoleRepository.existsByJobCategoryIdAndNameIgnoreCase(category.getId(), request.getName().trim())) {
            throw new AppException("Job role already exists in this category");
        }
        role.setJobCategory(category);
        role.setName(request.getName().trim());
        role.setDescription(request.getDescription());
        if (request.getIsActive() != null) role.setIsActive(request.getIsActive());
        return mapRole(jobRoleRepository.save(role));
    }

    @Transactional
    public void deleteRole(UUID id) {
        JobRole role = jobRoleRepository.findById(id).orElseThrow(() -> new AppException("Job role not found"));
        jobRoleRepository.delete(role);
    }

    private void validateName(String name, String message) {
        if (name == null || name.trim().isBlank()) throw new AppException(message);
    }

    private JobGroupResponse mapGroup(JobGroup group) {
        return JobGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .isActive(group.getIsActive())
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }

    private JobCategoryResponse mapCategory(JobCategory category) {
        JobGroup group = category.getJobGroup();
        return JobCategoryResponse.builder()
                .id(category.getId())
                .jobGroupId(group != null ? group.getId() : null)
                .jobGroupName(group != null ? group.getName() : null)
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    private JobRoleResponse mapRole(JobRole role) {
        JobCategory category = role.getJobCategory();
        JobGroup group = category != null ? category.getJobGroup() : null;
        return JobRoleResponse.builder()
                .id(role.getId())
                .jobCategoryId(category != null ? category.getId() : null)
                .jobCategoryName(category != null ? category.getName() : null)
                .jobGroupId(group != null ? group.getId() : null)
                .jobGroupName(group != null ? group.getName() : null)
                .name(role.getName())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}
