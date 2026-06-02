package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.QuestionBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionBookmarkRepository extends JpaRepository<QuestionBookmark, UUID> {
    Optional<QuestionBookmark> findByUserIdAndQuestionId(UUID userId, Integer questionId);
    boolean existsByUserIdAndQuestionId(UUID userId, Integer questionId);
    List<QuestionBookmark> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
    List<QuestionBookmark> findAllByUserIdAndQuestionIdIn(UUID userId, List<Integer> questionIds);
    void deleteByUserIdAndQuestionId(UUID userId, Integer questionId);
}
