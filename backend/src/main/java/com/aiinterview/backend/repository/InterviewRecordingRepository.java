package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.InterviewRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewRecordingRepository extends JpaRepository<InterviewRecording, UUID> {
    List<InterviewRecording> findBySessionIdAndDeletedAtIsNullOrderByCreatedAtAsc(UUID sessionId);
}
