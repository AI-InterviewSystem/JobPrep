package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.AnswerAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AnswerAnalysisRepository extends JpaRepository<AnswerAnalysis, UUID> {
}
