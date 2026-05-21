package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, UUID> {
    List<JobDescription> findByCreatedByIdOrIsPublicTrueOrderByCreatedAtDesc(UUID createdById);
    List<JobDescription> findByIsPublicTrueOrderByCreatedAtDesc();
    List<JobDescription> findByCreatedByIdOrderByCreatedAtDesc(UUID createdById);
}
