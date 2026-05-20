package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.Feedback;
import com.aiinterview.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    List<Feedback> findAllByUserOrderByCreatedAtDesc(User user);

    List<Feedback> findAllByOrderByCreatedAtDesc();
}
