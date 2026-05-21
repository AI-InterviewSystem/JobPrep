package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.InterviewAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, UUID> {
}
