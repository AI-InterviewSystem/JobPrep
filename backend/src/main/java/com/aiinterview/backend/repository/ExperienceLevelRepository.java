package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.ExperienceLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExperienceLevelRepository extends JpaRepository<ExperienceLevel, Integer> {
    List<ExperienceLevel> findAllByIsActiveTrueOrderByDisplayOrderAsc();
    List<ExperienceLevel> findAllByOrderByDisplayOrderAsc();
    boolean existsByCode(String code);
    Optional<ExperienceLevel> findByCode(String code);
}
