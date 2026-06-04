package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.UserLearningStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserLearningStatsRepository extends JpaRepository<UserLearningStats, UUID> {
}
