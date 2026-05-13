package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, UUID> {
    Optional<JobCategory> findByName(String name);
    boolean existsByName(String name);
}
