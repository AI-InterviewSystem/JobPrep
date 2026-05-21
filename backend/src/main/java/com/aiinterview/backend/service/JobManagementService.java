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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.aiinterview.backend.entity.AdminAction;
import com.aiinterview.backend.repository.AdminActionRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobManagementService {

    private final JobCategoryRepository categoryRepository;
    private final JobRoleRepository roleRepository;
    private final JobGroupRepository groupRepository;
    private final AdminActionRepository adminActionRepository;
    private final com.aiinterview.backend.repository.UserRepository userRepository;

    private void logAdminAction(String actionType, String reason) {
        String adminEmail = "system";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            adminEmail = auth.getName();
        }
        try {
            userRepository.findByEmail(adminEmail).ifPresent(admin -> {
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

    // --- Job Group Methods ---
    @Transactional(readOnly = true)
    public List<JobGroupResponse> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::mapToGroupResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobGroupResponse createGroup(JobGroupRequest request) {
        if (groupRepository.existsByName(request.getName())) {
            throw new AppException("Group name already exists");
        }
        JobGroup group = JobGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.isActive())
                .build();
        JobGroup saved = groupRepository.save(group);
        logAdminAction("CREATE_JOB_GROUP", "Created job group: " + saved.getName());
        return mapToGroupResponse(saved);
    }

    @Transactional
    public JobGroupResponse updateGroup(UUID id, JobGroupRequest request) {
        JobGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new AppException("Group not found"));
        
        groupRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException("Group name already exists");
                    }
                });

        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setActive(request.isActive());
        
        JobGroup saved = groupRepository.save(group);
        logAdminAction("UPDATE_JOB_GROUP", "Updated job group: " + saved.getName());
        return mapToGroupResponse(saved);
    }

    @Transactional
    public void deleteGroup(UUID id) {
        JobGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new AppException("Group not found"));
        String name = group.getName();
        groupRepository.delete(group);
        logAdminAction("DELETE_JOB_GROUP", "Deleted job group: " + name);
    }


    @Transactional(readOnly = true)
    public List<JobCategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobCategoryResponse createCategory(JobCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new AppException("Category name already exists");
        }
        JobGroup group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new AppException("Group not found"));
        }
        JobCategory category = JobCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .group(group)
                .build();
        JobCategory saved = categoryRepository.save(category);
        logAdminAction("CREATE_JOB_CATEGORY", "Created job category: " + saved.getName());
        return mapToCategoryResponse(saved);
    }

    @Transactional
    public JobCategoryResponse updateCategory(UUID id, JobCategoryRequest request) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Category not found"));
        
        categoryRepository.findByName(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new AppException("Category name already exists");
                    }
                });

        JobGroup group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new AppException("Group not found"));
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setGroup(group);
        
        JobCategory saved = categoryRepository.save(category);
        logAdminAction("UPDATE_JOB_CATEGORY", "Updated job category: " + saved.getName());
        return mapToCategoryResponse(saved);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Category not found"));
        
        String name = category.getName();
        categoryRepository.delete(category);
        logAdminAction("DELETE_JOB_CATEGORY", "Deleted job category: " + name);
    }

    @Transactional
    public JobRoleResponse createRole(JobRoleRequest request) {
        JobCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("Category not found"));

        if (roleRepository.existsByNameAndCategoryId(request.getName(), request.getCategoryId())) {
            throw new AppException("Role name already exists in this category");
        }

        JobRole role = JobRole.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .build();
        
        JobRole saved = roleRepository.save(role);
        logAdminAction("CREATE_JOB_ROLE", "Created job role: " + saved.getName());
        return mapToRoleResponse(saved);
    }

    @Transactional
    public JobRoleResponse updateRole(UUID id, JobRoleRequest request) {
        JobRole role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException("Role not found"));
        
        JobCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("Category not found"));

        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.setCategory(category);
        
        JobRole saved = roleRepository.save(role);
        logAdminAction("UPDATE_JOB_ROLE", "Updated job role: " + saved.getName());
        return mapToRoleResponse(saved);
    }

    @Transactional
    public void deleteRole(UUID id) {
        JobRole role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException("Role not found"));
        String name = role.getName();
        roleRepository.delete(role);
        logAdminAction("DELETE_JOB_ROLE", "Deleted job role: " + name);
    }

    private JobGroupResponse mapToGroupResponse(JobGroup group) {
        return JobGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .isActive(group.isActive())
                .categories(group.getCategories() == null ? List.of() : group.getCategories().stream()
                        .map(this::mapToCategoryResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private JobCategoryResponse mapToCategoryResponse(JobCategory category) {
        return JobCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .groupId(category.getGroup() != null ? category.getGroup().getId() : null)
                .roles(category.getRoles() == null ? List.of() : category.getRoles().stream()
                        .map(this::mapToRoleResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    private JobRoleResponse mapToRoleResponse(JobRole role) {
        return JobRoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .categoryId(role.getCategory().getId())
                .build();
    }
}
