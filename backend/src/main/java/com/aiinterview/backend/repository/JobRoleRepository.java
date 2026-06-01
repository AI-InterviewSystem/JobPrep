package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, UUID> {
    List<JobRole> findAllByOrderByNameAsc();
    List<JobRole> findAllByJobCategoryIdOrderByNameAsc(UUID jobCategoryId);
    List<JobRole> findAllByIsActiveTrueOrderByNameAsc();
    boolean existsByJobCategoryIdAndNameIgnoreCase(UUID jobCategoryId, String name);
}
