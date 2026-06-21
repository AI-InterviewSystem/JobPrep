package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.entity.*;
import com.aiinterview.backend.entity.InterviewAnswer.InputType;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PracticeService {

    private final PracticeSessionRepository practiceSessionRepository;
    private final PracticeAnswerRepository practiceAnswerRepository;
    private final QuestionBankRepository questionBankRepository;
    private final QuestionTopicRepository questionTopicRepository;
    private final UserRepository userRepository;
    private final QuestionBankService questionBankService;
    private final AiApiClient aiApiClient;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;
    private final SubscriptionLimitService subscriptionLimitService;

    @Transactional
    public PracticeSessionResponse startSession(StartPracticeSessionRequest request) {
        User user = getCurrentUser();
        
        subscriptionLimitService.checkPracticeQuestionLimit(user);
        
        QuestionTopic topic = request.getTopicId() != null
                ? questionTopicRepository.findById(request.getTopicId())
                        .orElseThrow(() -> new AppException("Topic not found"))
                : null;

        List<QuestionBankResponse> selectedQuestions;
        if (request.getQuestionId() != null) {
            selectedQuestions = List.of(questionBankService.getUserQuestionDetail(request.getQuestionId()));
            if (topic == null && selectedQuestions.get(0).getTopicId() != null) {
                topic = questionTopicRepository.findById(selectedQuestions.get(0).getTopicId()).orElse(null);
            }
        } else {
            int limit = request.getTotalQuestions() != null ? Math.max(1, Math.min(request.getTotalQuestions(), 10))
                    : 5;
            selectedQuestions = questionBankService.getUserQuestions(
                    request.getRole(),
                    request.getLevel(),
                    request.getTopicId(),
                    null,
                    false)
                    .stream()
                    .limit(limit)
                    .toList();
        }

        if (selectedQuestions.isEmpty()) {
            throw new AppException("No active questions found for this practice scope");
        }

        PracticeSession session = PracticeSession.builder()
                .user(user)
                .topic(topic)
                .role(cleanBlank(request.getRole()))
                .level(cleanBlank(request.getLevel()))
                .totalQuestions(selectedQuestions.size())
                .completedQuestions(0)
                .status("in_progress")
                .build();
        PracticeSession saved = practiceSessionRepository.save(session);
        return mapSession(saved, selectedQuestions);
    }

    @Transactional
    public PracticeAnswerResponse submitAnswer(UUID sessionId, SubmitPracticeAnswerRequest request) {
        User user = getCurrentUser();
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException("Practice session not found"));
        if (!session.getUser().getId().equals(user.getId())) {
            throw new AppException("Unauthorized");
        }
        QuestionBank question = questionBankRepository.findById(request.getQuestionId())
                .filter(q -> q.getDeletedAt() == null && Boolean.TRUE.equals(q.getIsActive()))
                .orElseThrow(() -> new AppException("Question not found"));
        if (request.getAnswerText() == null || request.getAnswerText().trim().isBlank()) {
            throw new AppException("Answer text is required");
        }
        
        subscriptionLimitService.checkPracticeQuestionLimit(user);

        PracticeAnswer answer = PracticeAnswer.builder()
                .practiceSession(session)
                .question(question)
                .answerText(request.getAnswerText().trim())
                .audioStoragePath(cleanBlank(request.getAudioStoragePath()))
                .inputType(request.getInputType() != null ? request.getInputType() : InputType.TEXT)
                .build();
        applyAiFeedback(answer, session, question, request.getOutputLanguage());
        PracticeAnswer saved = practiceAnswerRepository.save(answer);
        updateSessionAndMetrics(session, question, saved);
        return mapAnswer(saved);
    }

    @Transactional(readOnly = true)
    public List<PracticeAnswerResponse> getSessionAnswers(UUID sessionId) {
        User user = getCurrentUser();
        PracticeSession session = practiceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException("Practice session not found"));
        if (!session.getUser().getId().equals(user.getId())) {
            throw new AppException("Unauthorized");
        }
        return practiceAnswerRepository.findAllByPracticeSessionId(sessionId).stream().map(this::mapAnswer).toList();
    }

    private void applyAiFeedback(PracticeAnswer answer, PracticeSession session, QuestionBank question, String outputLanguage) {
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("session_id", session.getId().toString());
            req.put("question_id", String.valueOf(question.getId()));
            req.put("question_text", question.getQuestionText());
            req.put("user_answer", answer.getAnswerText());
            req.put("practice_mode", true);
            req.put("output_language", normalizeOutputLanguage(outputLanguage));

            String aiResponse = aiApiClient.submitQuestionBankPracticeAnswer(session.getId().toString(), req);
            JsonNode root = objectMapper.readTree(aiResponse);
            JsonNode evaluation = root.has("evaluation") ? root.get("evaluation") : root;

            BigDecimal score = decimalFrom(evaluation, "score", "overall_score");
            answer.setScore(score);
            answer.setFeedbackSummary(textFrom(evaluation, "feedback", "feedback_summary", "summary"));
            List<String> improvements = listFrom(evaluation, "suggested_improvements", "improvement_suggestions",
                    "weaknesses");
            if (improvements.isEmpty() && evaluation.has("improved_answer")) {
                improvements = List.of(evaluation.get("improved_answer").asText());
            }
            answer.setSuggestedImprovements(improvements);
        } catch (Exception e) {
            log.warn("Practice AI feedback unavailable for question {}: {}", question.getId(), e.getMessage());
            answer.setScore(null);
            answer.setFeedbackSummary(
                    "AI feedback is temporarily unavailable. Your answer was saved for practice history.");
            answer.setSuggestedImprovements(List.of("Try again later to receive AI evaluation."));
        }
    }

    private void updateSessionAndMetrics(PracticeSession session, QuestionBank question, PracticeAnswer currentAnswer) {
        List<PracticeAnswer> answers = new ArrayList<>(practiceAnswerRepository.findAllByPracticeSessionId(session.getId()));
        answers.add(currentAnswer);
        int completed = answers.size();
        session.setCompletedQuestions(completed);
        if (session.getTotalQuestions() != null && completed >= session.getTotalQuestions()) {
            session.setStatus("completed");
            session.setCompletedAt(LocalDateTime.now());
        }
        List<BigDecimal> scores = answers.stream().map(PracticeAnswer::getScore).filter(Objects::nonNull).toList();
        if (!scores.isEmpty()) {
            BigDecimal total = scores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            session.setOverallScore(total.divide(BigDecimal.valueOf(scores.size()), 2, RoundingMode.HALF_UP));
        }
        practiceSessionRepository.save(session);

        if (question.getTopic() != null) {
            BigDecimal score = currentAnswer.getScore() != null ? currentAnswer.getScore() : BigDecimal.ZERO;
            jdbcTemplate.update(
                    """
                            INSERT INTO user_topic_metrics (user_id, topic_id, total_practiced, correct_count, avg_score, best_score, weakest_score, last_practiced_at, created_at, updated_at)
                            VALUES (?, ?, 1, ?, ?, ?, ?, now(), now(), now())
                            ON CONFLICT (user_id, topic_id) DO UPDATE SET
                                total_practiced = user_topic_metrics.total_practiced + 1,
                                correct_count = user_topic_metrics.correct_count + EXCLUDED.correct_count,
                                avg_score = COALESCE((user_topic_metrics.avg_score * user_topic_metrics.total_practiced + EXCLUDED.avg_score) / NULLIF(user_topic_metrics.total_practiced + 1, 0), EXCLUDED.avg_score),
                                best_score = GREATEST(COALESCE(user_topic_metrics.best_score, EXCLUDED.best_score), EXCLUDED.best_score),
                                weakest_score = LEAST(COALESCE(user_topic_metrics.weakest_score, EXCLUDED.weakest_score), EXCLUDED.weakest_score),
                                last_practiced_at = now(),
                                updated_at = now()
                            """,
                    session.getUser().getId(),
                    question.getTopic().getId(),
                    score.compareTo(BigDecimal.valueOf(70)) >= 0 ? 1 : 0,
                    score,
                    score,
                    score);
        }
    }

    private PracticeSessionResponse mapSession(PracticeSession session, List<QuestionBankResponse> questions) {
        QuestionTopic topic = session.getTopic();
        return PracticeSessionResponse.builder()
                .id(session.getId())
                .topicId(topic != null ? topic.getId() : null)
                .topicName(topic != null ? topic.getName() : null)
                .role(session.getRole())
                .level(session.getLevel())
                .status(session.getStatus())
                .totalQuestions(session.getTotalQuestions())
                .completedQuestions(session.getCompletedQuestions())
                .overallScore(session.getOverallScore())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .questions(questions)
                .build();
    }

    private PracticeAnswerResponse mapAnswer(PracticeAnswer answer) {
        return PracticeAnswerResponse.builder()
                .id(answer.getId())
                .practiceSessionId(answer.getPracticeSession().getId())
                .questionId(answer.getQuestion().getId())
                .answerText(answer.getAnswerText())
                .inputType(answer.getInputType() != null ? answer.getInputType().name() : null)
                .score(answer.getScore())
                .feedbackSummary(answer.getFeedbackSummary())
                .suggestedImprovements(answer.getSuggestedImprovements())
                .answeredAt(answer.getAnsweredAt())
                .build();
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            throw new AppException("Authentication required");
        return userRepository.findByEmail(auth.getName()).orElseThrow(() -> new AppException("User not found"));
    }

    private String cleanBlank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String normalizeOutputLanguage(String value) {
        return "vi".equalsIgnoreCase(value != null ? value.trim() : null) ? "vi" : "en";
    }

    private BigDecimal decimalFrom(JsonNode node, String... fields) {
        if (node == null)
            return null;
        for (String field : fields) {
            if (node.has(field) && !node.get(field).isNull()) {
                try {
                    return new BigDecimal(node.get(field).asText());
                } catch (NumberFormatException ignored) {
                    return null;
                }
            }
        }
        return null;
    }

    private String textFrom(JsonNode node, String... fields) {
        if (node == null)
            return null;
        for (String field : fields) {
            if (node.has(field) && !node.get(field).isNull()) {
                return node.get(field).asText();
            }
        }
        return null;
    }

    private List<String> listFrom(JsonNode node, String... fields) {
        if (node == null)
            return List.of();
        for (String field : fields) {
            if (node.has(field) && node.get(field).isArray()) {
                List<String> values = new ArrayList<>();
                node.get(field).forEach(item -> values.add(item.asText()));
                return values;
            }
        }
        return List.of();
    }
}
