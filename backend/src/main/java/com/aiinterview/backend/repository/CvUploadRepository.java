package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.CvUpload;
import com.aiinterview.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvUploadRepository extends JpaRepository<CvUpload, UUID> {
    List<CvUpload> findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(User user);
    Optional<CvUpload> findByIdAndUserAndDeletedAtIsNull(UUID id, User user);
    Optional<CvUpload> findByUserAndIsCurrentTrueAndDeletedAtIsNull(User user);
}
