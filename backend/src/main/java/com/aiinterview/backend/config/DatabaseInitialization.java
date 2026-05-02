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
    }
}
