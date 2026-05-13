package com.aiinterview.backend.config;

import com.aiinterview.backend.entity.JobCategory;
import com.aiinterview.backend.entity.JobRole;
import com.aiinterview.backend.repository.JobCategoryRepository;
import com.aiinterview.backend.repository.JobRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class JobDataSeeder {

    private final JobCategoryRepository categoryRepository;
    private final JobRoleRepository roleRepository;

    @Bean
    CommandLineRunner seedJobs() {
        return args -> {
            if (categoryRepository.count() > 0) {
                log.info("Job categories already seeded. Skipping...");
                return;
            }

            log.info("Seeding initial job categories and roles...");

            // Category -> Description
            Map<String, String> categories = Map.of(
                "Software Engineering", "Core development of applications, systems, and platforms using modern programming languages and frameworks.",
                "Software Testing", "Ensuring software quality through rigorous testing methodologies, automated tools, and quality assurance processes.",
                "Artificial Intelligence (AI)", "Cutting-edge development of intelligent systems, machine learning models, and advanced data research."
            );

            // Role -> [Category, Description]
            Map<String, String[]> roles = Map.of(
                "Backend Developer", new String[]{"Software Engineering", "Specializes in server-side logic, database management, and API development. Focuses on performance, security, and scalability."},
                "Frontend Developer", new String[]{"Software Engineering", "Specializes in building user interfaces and experiences. Expert in HTML, CSS, JavaScript, and modern frameworks like React or Vue."},
                "Fullstack Developer", new String[]{"Software Engineering", "Proficient in both frontend and backend development. Capable of building a complete application from end-to-end."},
                "Software Tester (Automation & Manual)", new String[]{"Software Testing", "Executes manual tests and develops automated test scripts to identify bugs and ensure software reliability."},
                "QA Engineer", new String[]{"Software Testing", "Oversees the entire software development lifecycle to maintain quality standards and improve development processes."},
                "AI Engineer", new String[]{"Artificial Intelligence (AI)", "Develops and deploys AI models and machine learning algorithms into production-ready systems."},
                "AI Researcher", new String[]{"Artificial Intelligence (AI)", "Explores new AI theories, algorithms, and models. Focuses on advancing the state-of-the-art in machine intelligence."}
            );

            categories.forEach((name, desc) -> {
                JobCategory category = categoryRepository.save(JobCategory.builder()
                        .name(name)
                        .description(desc)
                        .build());

                roles.forEach((roleName, info) -> {
                    if (info[0].equals(name)) {
                        roleRepository.save(JobRole.builder()
                                .name(roleName)
                                .description(info[1])
                                .category(category)
                                .build());
                    }
                });
            });

            log.info("Successfully seeded categories and roles.");
        };
    }
}
