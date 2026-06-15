package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.PracticeAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PracticeAnswerRepository extends JpaRepository<PracticeAnswer, UUID> {
    List<PracticeAnswer> findAllByPracticeSessionId(UUID practiceSessionId);
    boolean existsByPracticeSessionIdAndQuestionId(UUID practiceSessionId, Integer questionId);
    boolean existsByPracticeSessionUserIdAndQuestionId(UUID userId, Integer questionId);
    List<PracticeAnswer> findAllByPracticeSessionUserIdAndQuestionIdIn(UUID userId, List<Integer> questionIds);
    long countByPracticeSessionUserIdAndAnsweredAtGreaterThanEqual(UUID userId, java.time.LocalDateTime startDate);
}
