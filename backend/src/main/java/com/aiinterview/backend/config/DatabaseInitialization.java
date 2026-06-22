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
            jdbcTemplate.execute("DROP TABLE IF EXISTS answer_analysis");
            log.info("Dropped obsolete answer_analysis table");
        } catch (Exception e) {
            log.warn("Could not drop answer_analysis table: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS target_table VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS target_id UUID");
            jdbcTemplate.execute("ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS old_data JSONB");
            jdbcTemplate.execute("ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS new_data JSONB");
            log.info("Ensured admin action audit columns exist");
        } catch (Exception e) {
            log.warn("Could not update admin_actions audit columns: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS title VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS interview_type VARCHAR(50) DEFAULT 'mock'");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS interview_language VARCHAR(10) DEFAULT 'EN'");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ALTER COLUMN interview_language SET DEFAULT 'EN'");
            jdbcTemplate.execute("UPDATE interview_sessions SET interview_language = UPPER(interview_language) WHERE interview_language IN ('en', 'vi')");
            jdbcTemplate.execute("UPDATE interview_sessions SET interview_language = 'EN' WHERE interview_language IS NULL OR interview_language = ''");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS role_snapshot VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS level_snapshot VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS completed_questions INTEGER DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS duration_seconds INTEGER");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS technical_score DECIMAL(5,2)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS communication_score DECIMAL(5,2)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS problem_solving_score DECIMAL(5,2)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS clarity_score DECIMAL(5,2)");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS retry_of_session_id UUID");
            jdbcTemplate.execute("ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()");
            log.info("Ensured interview history columns exist");
        } catch (Exception e) {
            log.warn("Could not update interview_sessions history columns: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto");
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS job_groups (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name VARCHAR(255) UNIQUE NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now()
                    )
                    """);
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS job_categories (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        group_id UUID REFERENCES job_groups(id),
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now(),
                        UNIQUE(group_id, name)
                    )
                    """);
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS job_roles (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        category_id UUID NOT NULL REFERENCES job_categories(id),
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now(),
                        UNIQUE(category_id, name)
                    )
                    """);
            log.info("Ensured job management tables exist");
        } catch (Exception e) {
            log.warn("Could not create job management tables: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS question_topics (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(100) UNIQUE NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now()
                    )
                    """);
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS question_bank (
                        id SERIAL PRIMARY KEY,
                        category_id UUID REFERENCES job_categories(id),
                        role_id UUID REFERENCES job_roles(id),
                        topic_id INTEGER REFERENCES question_topics(id),
                        question_text TEXT NOT NULL,
                        difficulty VARCHAR(20),
                        role VARCHAR(100),
                        level VARCHAR(50),
                        question_type VARCHAR(30),
                        sample_answer TEXT,
                        explanation TEXT,
                        created_by UUID REFERENCES users(id),
                        suggested_duration INTEGER DEFAULT 120,
                        tags TEXT[],
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now(),
                        deleted_at TIMESTAMPTZ
                    )
                    """);
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES job_categories(id)");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES job_roles(id)");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS topic_id INTEGER REFERENCES question_topics(id)");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS role VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS level VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS question_type VARCHAR(30)");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS sample_answer TEXT");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS explanation TEXT");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id)");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true");
            jdbcTemplate.execute("ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ");
            jdbcTemplate.execute("UPDATE question_bank SET is_active = true WHERE is_active IS NULL");
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS question_bookmarks (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        question_id INTEGER NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        UNIQUE(user_id, question_id)
                    )
                    """);
            jdbcTemplate.execute("UPDATE question_bank SET deleted_at = NULL WHERE deleted_at IS NOT NULL");
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS practice_sessions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        topic_id INTEGER REFERENCES question_topics(id),
                        category_id UUID REFERENCES job_categories(id),
                        role VARCHAR(100),
                        level VARCHAR(50),
                        status VARCHAR(30) DEFAULT 'in_progress',
                        total_questions INTEGER DEFAULT 0,
                        completed_questions INTEGER DEFAULT 0,
                        overall_score DECIMAL(5,2),
                        started_at TIMESTAMPTZ DEFAULT now(),
                        completed_at TIMESTAMPTZ,
                        created_at TIMESTAMPTZ DEFAULT now()
                    )
                    """);
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS practice_answers (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        practice_session_id UUID NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
                        question_id INTEGER NOT NULL REFERENCES question_bank(id),
                        answer_text TEXT,
                        audio_storage_path TEXT,
                        input_type VARCHAR(20),
                        score DECIMAL(5,2),
                        feedback_summary TEXT,
                        suggested_improvements JSONB,
                        answered_at TIMESTAMPTZ DEFAULT now()
                    )
                    """);
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS user_topic_metrics (
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        topic_id INTEGER NOT NULL REFERENCES question_topics(id),
                        total_practiced INTEGER DEFAULT 0,
                        correct_count INTEGER DEFAULT 0,
                        avg_score DECIMAL(5,2),
                        best_score DECIMAL(5,2),
                        weakest_score DECIMAL(5,2),
                        last_practiced_at TIMESTAMPTZ,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        updated_at TIMESTAMPTZ DEFAULT now(),
                        PRIMARY KEY(user_id, topic_id)
                    )
                    """);
            log.info("Ensured question_bank table exists");
        } catch (Exception e) {
            log.warn("Could not create question_bank table: {}", e.getMessage());
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

        try {
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS notifications (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        type VARCHAR(50) NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        content TEXT NOT NULL,
                        action_url TEXT,
                        action_label VARCHAR(100),
                        is_read BOOLEAN DEFAULT false,
                        metadata JSONB,
                        created_at TIMESTAMPTZ DEFAULT now(),
                        deleted_at TIMESTAMPTZ
                    )
                    """);
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS user_learning_stats (
                        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                        current_streak INTEGER DEFAULT 0,
                        longest_streak INTEGER DEFAULT 0,
                        last_activity_date DATE,
                        practice_reminders BOOLEAN DEFAULT true,
                        subscription_alerts BOOLEAN DEFAULT true,
                        learning_suggestions BOOLEAN DEFAULT true,
                        updated_at TIMESTAMPTZ DEFAULT now()
                    )
                    """);
            log.info("Ensured notifications and user_learning_stats tables exist");
        } catch (Exception e) {
            log.warn("Could not create notification tables: {}", e.getMessage());
        }
    }
}
