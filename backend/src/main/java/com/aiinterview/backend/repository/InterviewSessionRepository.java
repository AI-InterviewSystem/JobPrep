package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query(value = """
            SELECT DISTINCT s.*
            FROM interview_sessions s
            LEFT JOIN job_descriptions jd ON jd.id = s.job_description_id
            LEFT JOIN interview_questions q ON q.session_id = s.id
            WHERE s.user_id = :userId
              AND s.deleted_at IS NULL
              AND (:status IS NULL OR LOWER(CAST(s.status AS TEXT)) = LOWER(:status))
              AND (:role IS NULL OR LOWER(COALESCE(s.role_snapshot, '')) LIKE LOWER(CONCAT('%', :role, '%')))
              AND (:level IS NULL OR LOWER(COALESCE(s.level_snapshot, '')) = LOWER(:level))
              AND (:interviewType IS NULL OR LOWER(COALESCE(s.interview_type, '')) = LOWER(:interviewType))
              AND (:topic IS NULL OR LOWER(COALESCE(q.job_requirement_tag, '')) LIKE LOWER(CONCAT('%', :topic, '%')))
              AND (:minScore IS NULL OR s.overall_score >= :minScore)
              AND (:maxScore IS NULL OR s.overall_score <= :maxScore)
              AND (CAST(:fromDate AS DATE) IS NULL OR CAST(s.created_at AS DATE) >= CAST(:fromDate AS DATE))
              AND (CAST(:toDate AS DATE) IS NULL OR CAST(s.created_at AS DATE) <= CAST(:toDate AS DATE))
              AND (
                    :keyword IS NULL
                    OR LOWER(COALESCE(s.title, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(s.role_snapshot, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(s.level_snapshot, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(s.interview_type, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(jd.job_description_text, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(CAST(jd.key_requirements AS TEXT), '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(COALESCE(q.question_text, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR TO_CHAR(s.created_at, 'YYYY-MM-DD') LIKE CONCAT('%', :keyword, '%')
              )
            ORDER BY s.created_at DESC
            """, nativeQuery = true)
    List<InterviewSession> searchHistory(
            @Param("userId") UUID userId,
            @Param("keyword") String keyword,
            @Param("status") String status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("minScore") BigDecimal minScore,
            @Param("maxScore") BigDecimal maxScore,
            @Param("role") String role,
            @Param("level") String level,
            @Param("interviewType") String interviewType,
            @Param("topic") String topic
    );
}
