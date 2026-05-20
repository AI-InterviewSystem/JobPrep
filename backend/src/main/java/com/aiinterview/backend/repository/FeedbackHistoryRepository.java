package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.Feedback;
import com.aiinterview.backend.entity.FeedbackHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackHistoryRepository extends JpaRepository<FeedbackHistory, UUID> {
    List<FeedbackHistory> findAllByFeedbackOrderByCreatedAtDesc(Feedback feedback);
}
