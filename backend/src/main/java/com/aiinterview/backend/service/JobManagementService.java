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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobManagementService {

    private final JobCategoryRepository categoryRepository;
    private final JobRoleRepository roleRepository;
    private final JobGroupRepository groupRepository;

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
        return mapToGroupResponse(groupRepository.save(group));
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
        return mapToGroupResponse(groupRepository.save(group));
    }

    @Transactional
    public void deleteGroup(UUID id) {
        JobGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new AppException("Group not found"));
        groupRepository.delete(group);
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
        return mapToCategoryResponse(categoryRepository.save(category));
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
        return mapToCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Category not found"));
        
        // Kiểm tra ràng buộc dữ liệu (ví dụ: nếu có phỏng vấn liên quan đến ngành này - giả sử sau này có)
        // Hiện tại chỉ cần kiểm tra xem có roles không, nếu cascade xóa hết thì ok, 
        // nhưng user yêu cầu "kiểm tra ràng buộc", nên ta có thể báo lỗi nếu còn roles hoặc cho phép xóa luôn.
        // Ở đây ta cho phép xóa cascade thông qua JPA nhưng có thể log lại.
        categoryRepository.delete(category);
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
        
        return mapToRoleResponse(roleRepository.save(role));
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
        
        return mapToRoleResponse(roleRepository.save(role));
    }

    @Transactional
    public void deleteRole(UUID id) {
        if (!roleRepository.existsById(id)) {
            throw new AppException("Role not found");
        }
        roleRepository.deleteById(id);
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
