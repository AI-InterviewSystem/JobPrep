package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.JobGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobGroupRepository extends JpaRepository<JobGroup, UUID> {
    List<JobGroup> findAllByOrderByNameAsc();
    List<JobGroup> findAllByIsActiveTrueOrderByNameAsc();
    boolean existsByNameIgnoreCase(String name);
}
