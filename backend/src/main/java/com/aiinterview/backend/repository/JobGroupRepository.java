package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.JobGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobGroupRepository extends JpaRepository<JobGroup, UUID> {
    boolean existsByName(String name);
    Optional<JobGroup> findByName(String name);
}
