package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.QuestionTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionTopicRepository extends JpaRepository<QuestionTopic, Integer> {
    List<QuestionTopic> findAllByIsActiveTrueOrderByNameAsc();
}
