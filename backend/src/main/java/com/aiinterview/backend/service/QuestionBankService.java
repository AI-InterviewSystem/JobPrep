package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.QuestionBankRequest;
import com.aiinterview.backend.dto.QuestionBankResponse;
import com.aiinterview.backend.entity.JobCategory;
import com.aiinterview.backend.entity.JobGroup;
import com.aiinterview.backend.entity.JobRole;
import com.aiinterview.backend.entity.QuestionBookmark;
import com.aiinterview.backend.entity.QuestionBank;
import com.aiinterview.backend.entity.QuestionTopic;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.dto.QuestionTopicResponse;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.JobCategoryRepository;
import com.aiinterview.backend.repository.JobRoleRepository;
import com.aiinterview.backend.repository.PracticeAnswerRepository;
import com.aiinterview.backend.repository.QuestionBookmarkRepository;
import com.aiinterview.backend.repository.QuestionBankRepository;
import com.aiinterview.backend.repository.QuestionTopicRepository;
import com.aiinterview.backend.repository.UserRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final JobRoleRepository jobRoleRepository;
    private final QuestionTopicRepository questionTopicRepository;
    private final QuestionBookmarkRepository questionBookmarkRepository;
    private final PracticeAnswerRepository practiceAnswerRepository;
    private final UserRepository userRepository;

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
        return questionBankRepository.findAll(spec).stream().map(question -> mapQuestion(question, false, false)).toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionBankResponse> getUserQuestions(String role, String level, Integer topicId, String questionType, Boolean bookmarkedOnly) {
        User user = getCurrentUser();
        Specification<QuestionBank> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));
            predicates.add(cb.isTrue(root.get("isActive")));
            if (role != null && !role.isBlank()) {
                var roleJoin = root.join("jobRole", JoinType.LEFT);
                String value = role.toLowerCase();
                predicates.add(cb.or(
                        cb.equal(cb.lower(root.get("role")), value),
                        cb.equal(cb.lower(roleJoin.get("name")), value)
                ));
            }
            if (level != null && !level.isBlank()) {
                String value = level.toLowerCase();
                predicates.add(cb.or(
                        cb.equal(cb.lower(root.get("level")), value),
                        cb.equal(cb.lower(root.get("difficulty")), value)
                ));
            }
            if (topicId != null) predicates.add(cb.equal(root.get("topic").get("id"), topicId));
            if (questionType != null && !questionType.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("questionType")), questionType.toLowerCase()));
            }
            query.orderBy(cb.desc(root.get("updatedAt")), cb.desc(root.get("id")));
            return cb.and(predicates.toArray(Predicate[]::new));
        };

        List<QuestionBank> questions = questionBankRepository.findAll(spec);
        Set<Integer> bookmarkedIds = getBookmarkedIds(user, questions.stream().map(QuestionBank::getId).toList());
        Set<Integer> practicedIds = getPracticedIds(user, questions.stream().map(QuestionBank::getId).toList());
        return questions.stream()
                .filter(question -> !Boolean.TRUE.equals(bookmarkedOnly) || bookmarkedIds.contains(question.getId()))
                .map(question -> mapQuestion(question, bookmarkedIds.contains(question.getId()), practicedIds.contains(question.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionBankResponse getUserQuestionDetail(Integer id) {
        User user = getCurrentUser();
        QuestionBank question = questionBankRepository.findById(id)
                .filter(q -> q.getDeletedAt() == null && Boolean.TRUE.equals(q.getIsActive()))
                .orElseThrow(() -> new AppException("Question not found"));
        boolean bookmarked = questionBookmarkRepository.existsByUserIdAndQuestionId(user.getId(), id);
        boolean practiced = practiceAnswerRepository.existsByPracticeSessionUserIdAndQuestionId(user.getId(), id);
        return mapQuestion(question, bookmarked, practiced);
    }

    @Transactional(readOnly = true)
    public List<QuestionBankResponse> getBookmarkedQuestions() {
        User user = getCurrentUser();
        return questionBookmarkRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(QuestionBookmark::getQuestion)
                .filter(question -> question.getDeletedAt() == null && Boolean.TRUE.equals(question.getIsActive()))
                .map(question -> mapQuestion(question, true,
                        practiceAnswerRepository.existsByPracticeSessionUserIdAndQuestionId(user.getId(), question.getId())))
                .toList();
    }

    @Transactional
    public QuestionBankResponse bookmarkQuestion(Integer questionId) {
        User user = getCurrentUser();
        QuestionBank question = questionBankRepository.findById(questionId)
                .filter(q -> q.getDeletedAt() == null && Boolean.TRUE.equals(q.getIsActive()))
                .orElseThrow(() -> new AppException("Question not found"));
        if (!questionBookmarkRepository.existsByUserIdAndQuestionId(user.getId(), questionId)) {
            questionBookmarkRepository.save(QuestionBookmark.builder().user(user).question(question).build());
        }
        boolean practiced = practiceAnswerRepository.existsByPracticeSessionUserIdAndQuestionId(user.getId(), questionId);
        return mapQuestion(question, true, practiced);
    }

    @Transactional
    public void removeBookmark(Integer questionId) {
        User user = getCurrentUser();
        questionBookmarkRepository.deleteByUserIdAndQuestionId(user.getId(), questionId);
    }

    @Transactional(readOnly = true)
    public List<QuestionTopicResponse> getActiveTopics() {
        return questionTopicRepository.findAllByIsActiveTrueOrderByNameAsc().stream()
                .map(topic -> QuestionTopicResponse.builder()
                        .id(topic.getId())
                        .name(topic.getName())
                        .description(topic.getDescription())
                        .build())
                .toList();
    }

    @Transactional
    public QuestionBankResponse createQuestion(QuestionBankRequest request) {
        QuestionBank question = QuestionBank.builder().build();
        applyRequest(question, request);
        return mapQuestion(questionBankRepository.save(question), false, false);
    }

    @Transactional
    public QuestionBankResponse updateQuestion(Integer id, QuestionBankRequest request) {
        QuestionBank question = questionBankRepository.findById(id)
                .filter(q -> q.getDeletedAt() == null)
                .orElseThrow(() -> new AppException("Question not found"));
        applyRequest(question, request);
        return mapQuestion(questionBankRepository.save(question), false, false);
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
        return mapQuestion(questionBankRepository.save(question), false, false);
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

        QuestionTopic topic = null;
        if (request.getTopicId() != null) {
            topic = questionTopicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new AppException("Question topic not found"));
        }

        question.setJobCategory(category);
        question.setJobRole(role);
        question.setTopic(topic);
        question.setQuestionText(request.getQuestionText().trim());
        question.setDifficulty(normalize(request.getDifficulty()));
        question.setRole(normalize(request.getRole()));
        question.setLevel(normalize(request.getLevel()));
        question.setQuestionType(normalize(request.getQuestionType()));
        question.setSampleAnswer(normalize(request.getSampleAnswer()));
        question.setExplanation(normalize(request.getExplanation()));
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

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AppException("Authentication required");
        }
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new AppException("User not found"));
    }

    private Set<Integer> getBookmarkedIds(User user, List<Integer> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) return Set.of();
        return questionBookmarkRepository.findAllByUserIdAndQuestionIdIn(user.getId(), questionIds).stream()
                .map(bookmark -> bookmark.getQuestion().getId())
                .collect(Collectors.toSet());
    }

    private Set<Integer> getPracticedIds(User user, List<Integer> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) return Set.of();
        return practiceAnswerRepository.findAllByPracticeSessionUserIdAndQuestionIdIn(user.getId(), questionIds).stream()
                .map(answer -> answer.getQuestion().getId())
                .collect(Collectors.toSet());
    }

    private QuestionBankResponse mapQuestion(QuestionBank question, boolean bookmarked, boolean practiced) {
        JobCategory category = question.getJobCategory();
        JobGroup group = category != null ? category.getJobGroup() : null;
        JobRole jobRole = question.getJobRole();
        QuestionTopic topic = question.getTopic();
        String displayRole = question.getRole() != null ? question.getRole() : (jobRole != null ? jobRole.getName() : null);
        String displayLevel = question.getLevel() != null ? question.getLevel() : question.getDifficulty();
        return QuestionBankResponse.builder()
                .id(question.getId())
                .jobGroupId(group != null ? group.getId() : null)
                .jobGroupName(group != null ? group.getName() : null)
                .jobCategoryId(category != null ? category.getId() : null)
                .jobCategoryName(category != null ? category.getName() : null)
                .jobRoleId(jobRole != null ? jobRole.getId() : null)
                .jobRoleName(jobRole != null ? jobRole.getName() : null)
                .topicId(topic != null ? topic.getId() : null)
                .topicName(topic != null ? topic.getName() : null)
                .questionText(question.getQuestionText())
                .difficulty(question.getDifficulty())
                .role(displayRole)
                .level(displayLevel)
                .questionType(question.getQuestionType())
                .sampleAnswer(question.getSampleAnswer())
                .explanation(question.getExplanation())
                .suggestedDuration(question.getSuggestedDuration())
                .tags(question.getTags() != null ? Arrays.asList(question.getTags()) : List.of())
                .isActive(question.getIsActive())
                .bookmarked(bookmarked)
                .practiced(practiced)
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .build();
    }
}
