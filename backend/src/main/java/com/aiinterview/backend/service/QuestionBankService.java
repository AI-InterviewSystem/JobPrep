package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.QuestionBankRequest;
import com.aiinterview.backend.dto.QuestionBankResponse;
import com.aiinterview.backend.entity.JobCategory;
import com.aiinterview.backend.entity.JobGroup;
import com.aiinterview.backend.entity.JobRole;
import com.aiinterview.backend.entity.QuestionBank;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.JobCategoryRepository;
import com.aiinterview.backend.repository.JobRoleRepository;
import com.aiinterview.backend.repository.QuestionBankRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final JobRoleRepository jobRoleRepository;

    @Transactional(readOnly = true)
    public List<QuestionBankResponse> getQuestions(UUID categoryId, UUID roleId, String difficulty, String questionType, Boolean isActive) {
        Specification<QuestionBank> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));
            if (categoryId != null) predicates.add(cb.equal(root.get("jobCategory").get("id"), categoryId));
            if (roleId != null) predicates.add(cb.equal(root.get("jobRole").get("id"), roleId));
            if (difficulty != null && !difficulty.isBlank()) predicates.add(cb.equal(cb.lower(root.get("difficulty")), difficulty.toLowerCase()));
            if (questionType != null && !questionType.isBlank()) predicates.add(cb.equal(cb.lower(root.get("questionType")), questionType.toLowerCase()));
            if (isActive != null) predicates.add(cb.equal(root.get("isActive"), isActive));
            query.orderBy(cb.desc(root.get("updatedAt")), cb.desc(root.get("id")));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return questionBankRepository.findAll(spec).stream().map(this::mapQuestion).toList();
    }

    @Transactional
    public QuestionBankResponse createQuestion(QuestionBankRequest request) {
        QuestionBank question = QuestionBank.builder().build();
        applyRequest(question, request);
        return mapQuestion(questionBankRepository.save(question));
    }

    @Transactional
    public QuestionBankResponse updateQuestion(Integer id, QuestionBankRequest request) {
        QuestionBank question = questionBankRepository.findById(id)
                .filter(q -> q.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("Question not found"));
        applyRequest(question, request);
        return mapQuestion(questionBankRepository.save(question));
    }

    @Transactional
    public void deleteQuestion(Integer id) {
        QuestionBank question = questionBankRepository.findById(id)
                .filter(q -> q.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("Question not found"));
        question.setDeletedAt(LocalDateTime.now());
        questionBankRepository.save(question);
    }

    @Transactional
    public QuestionBankResponse setActive(Integer id, boolean active) {
        QuestionBank question = questionBankRepository.findById(id)
                .filter(q -> q.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("Question not found"));
        question.setIsActive(active);
        return mapQuestion(questionBankRepository.save(question));
    }

    @Transactional
    public List<QuestionBankResponse> importQuestions(List<QuestionBankRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new AppException("Import data is empty");
        }
        return requests.stream().map(this::createQuestion).toList();
    }

    private void applyRequest(QuestionBank question, QuestionBankRequest request) {
        if (request.getQuestionText() == null || request.getQuestionText().trim().isBlank()) {
            throw new AppException("Question text is required");
        }

        JobCategory category = null;
        if (request.getJobCategoryId() != null) {
            category = jobCategoryRepository.findById(request.getJobCategoryId())
                    .orElseThrow(() -> new AppException("Job category not found"));
        }

        JobRole role = null;
        if (request.getJobRoleId() != null) {
            role = jobRoleRepository.findById(request.getJobRoleId())
                    .orElseThrow(() -> new AppException("Job role not found"));
            if (category == null) {
                category = role.getJobCategory();
            } else if (!role.getJobCategory().getId().equals(category.getId())) {
                throw new AppException("Job role does not belong to selected category");
            }
        }

        question.setJobCategory(category);
        question.setJobRole(role);
        question.setQuestionText(request.getQuestionText().trim());
        question.setDifficulty(normalize(request.getDifficulty()));
        question.setQuestionType(normalize(request.getQuestionType()));
        question.setSuggestedDuration(request.getSuggestedDuration() != null ? request.getSuggestedDuration() : 120);
        List<String> tags = request.getTags() != null ? request.getTags().stream()
                .filter(tag -> tag != null && !tag.trim().isBlank())
                .map(tag -> tag.trim())
                .toList() : List.of();
        question.setTags(tags.toArray(String[]::new));
        question.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
    }

    private String normalize(String value) {
        return value == null || value.trim().isBlank() ? null : value.trim();
    }

    private QuestionBankResponse mapQuestion(QuestionBank question) {
        JobCategory category = question.getJobCategory();
        JobGroup group = category != null ? category.getJobGroup() : null;
        JobRole role = question.getJobRole();
        return QuestionBankResponse.builder()
                .id(question.getId())
                .jobGroupId(group != null ? group.getId() : null)
                .jobGroupName(group != null ? group.getName() : null)
                .jobCategoryId(category != null ? category.getId() : null)
                .jobCategoryName(category != null ? category.getName() : null)
                .jobRoleId(role != null ? role.getId() : null)
                .jobRoleName(role != null ? role.getName() : null)
                .questionText(question.getQuestionText())
                .difficulty(question.getDifficulty())
                .questionType(question.getQuestionType())
                .suggestedDuration(question.getSuggestedDuration())
                .tags(question.getTags() != null ? Arrays.asList(question.getTags()) : List.of())
                .isActive(question.getIsActive())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
