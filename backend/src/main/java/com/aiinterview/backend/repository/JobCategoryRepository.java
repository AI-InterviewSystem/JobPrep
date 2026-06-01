package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, UUID> {
    List<JobCategory> findAllByOrderByNameAsc();
    List<JobCategory> findAllByJobGroupIdOrderByNameAsc(UUID jobGroupId);
    List<JobCategory> findAllByIsActiveTrueOrderByNameAsc();
    boolean existsByJobGroupIdAndNameIgnoreCase(UUID jobGroupId, String name);
}
