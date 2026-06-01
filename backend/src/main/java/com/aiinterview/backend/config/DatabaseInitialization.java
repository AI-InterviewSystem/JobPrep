package com.aiinterview.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitialization {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        log.info("Checking and updating database constraints...");
        try {
            // Drop the old enum check constraint that might be blocking new status values
            jdbcTemplate.execute("ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_status_check");
            log.info("Successfully dropped user_subscriptions_status_check constraint");
        } catch (Exception e) {
            log.warn("Could not drop constraint (it might not exist or already be dropped): {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS interview_recordings (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        session_id UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
                        question_id UUID REFERENCES interview_questions(id) ON DELETE CASCADE,
                        answer_id UUID REFERENCES interview_answers(id) ON DELETE SET NULL,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        recording_type VARCHAR(20) NOT NULL CHECK (recording_type IN ('audio', 'video')),
                        provider VARCHAR(50) DEFAULT 'supabase',
                        bucket_name VARCHAR(100) NOT NULL DEFAULT 'interview-recordings',
                        file_path TEXT NOT NULL,
                        mime_type VARCHAR(100),
                        file_size BIGINT,
                        duration_seconds INTEGER,
                        transcript_text TEXT,
                        processing_status VARCHAR(30) DEFAULT 'uploaded'
                            CHECK (processing_status IN ('uploaded', 'processing', 'completed', 'failed')),
                        created_at TIMESTAMPTZ DEFAULT now(),
                        deleted_at TIMESTAMPTZ
                    )
                    """);
            log.info("Ensured interview_recordings table exists");
        } catch (Exception e) {
            log.warn("Could not create interview_recordings table: {}", e.getMessage());
        }
    }
}
