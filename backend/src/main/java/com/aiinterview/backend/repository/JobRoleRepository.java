package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, UUID> {
    List<JobRole> findAllByOrderByNameAsc();
    List<JobRole> findAllByJobCategoryIdOrderByNameAsc(UUID jobCategoryId);
    List<JobRole> findAllByIsActiveTrueOrderByNameAsc();

    /** Returns roles that are active or have a null is_active flag (treated as active). */
    @Query("SELECT r FROM JobRole r WHERE r.isActive IS TRUE OR r.isActive IS NULL ORDER BY r.name ASC")
    List<JobRole> findAllActiveOrNullOrderByNameAsc();

    boolean existsByJobCategoryIdAndNameIgnoreCase(UUID jobCategoryId, String name);
}
