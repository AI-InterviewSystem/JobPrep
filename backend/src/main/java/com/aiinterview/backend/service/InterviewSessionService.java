package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.entity.*;
import com.aiinterview.backend.entity.InterviewAnswer.InputType;
import com.aiinterview.backend.entity.InterviewSession.InterviewStatus;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewSessionService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewRecordingRepository recordingRepository;
    private final UserRepository userRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final AiApiClient aiApiClient;
    private final CvUploadService cvUploadService;
    private final InterviewRecordingService interviewRecordingService;
    private final ObjectMapper objectMapper;

    @Transactional
    public InterviewSessionResponse createSession(String userEmail, UUID jobDescriptionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("User not found"));

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .status(InterviewStatus.CREATED)
                .build();

        if (jobDescriptionId != null) {
            jobDescriptionRepository.findById(jobDescriptionId).ifPresent(session::setJobDescription);
        }

        InterviewSession saved = sessionRepository.save(session);
        return buildResponse(saved, Collections.emptyList());
    }

    @Transactional(readOnly = true)
    public InterviewSessionResponse getSession(UUID sessionId, String userEmail) {
        InterviewSession session = findSession(sessionId, userEmail);
        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        return buildResponse(session, questions);
    }

    @Transactional
    public InterviewSessionResponse startSession(UUID sessionId, String userEmail, StartInterviewSessionRequest startRequest) {
        InterviewSession session = findSession(sessionId, userEmail);
        User user = session.getUser();
        List<InterviewQuestion> existingQuestions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        if (session.getStatus() == InterviewStatus.IN_PROGRESS && session.getAiSessionId() != null && !existingQuestions.isEmpty()) {
            return buildResponse(session, existingQuestions);
        }

        Map<String, Object> cvDataObj = cvUploadService.getCvDataForAi(user);
        if (cvDataObj == null || cvDataObj.isEmpty()) {
            throw new AppException("No parsed CV data found. Upload a CV and wait for AI parsing before starting the interview.");
        }

        String interviewType = mapInterviewType(startRequest != null ? startRequest.getInterviewType() : null);
        String interviewLevel = mapInterviewLevel(startRequest != null ? startRequest.getInterviewLevel() : null);
        int numQuestions = startRequest != null && startRequest.getNumQuestions() != null
                ? startRequest.getNumQuestions()
                : 5;

        try {
            Map<String, Object> req = new HashMap<>();
            req.put("cv_data", cvDataObj);
            if (session.getJobDescription() != null) {
                req.put("job_description", session.getJobDescription().getJobDescriptionText());
            } else {
                req.put("job_description", "General technical interview.");
            }
            req.put("interview_type", interviewType);
            req.put("interview_level", interviewLevel);
            req.put("num_questions", numQuestions);
            req.put("passing_score", 0);

            log.info("Starting AI interview session. sessionId={}, interviewType={}, interviewLevel={}, hasJobDescription={}",
                    sessionId, interviewType, interviewLevel, session.getJobDescription() != null);
            String aiResponse = aiApiClient.startInterview(req);

            JsonNode resNode = objectMapper.readTree(aiResponse);

            if (resNode.has("status") && "rejected".equals(resNode.get("status").asText())) {
                throw new AppException("Rejected by AI: " +
                        (resNode.has("message") ? resNode.get("message").asText() : "Score too low"));
            }

            session.setAiSessionId(resNode.has("session_id") ? resNode.get("session_id").asText() : null);
            session.setStatus(InterviewStatus.IN_PROGRESS);
            session.setStartTime(LocalDateTime.now());
            InterviewSession saved = sessionRepository.save(session);

            JsonNode nextQ = resNode.get("next_question");
            List<InterviewQuestion> questions = new ArrayList<>();
            if (nextQ != null && !nextQ.isNull()) {
                String questionText = nextQ.has("question_text") ? nextQ.get("question_text").asText() : "";
                if (questionText.isBlank()) {
                    throw new AppException("AI did not return a valid next_question.question_text.");
                }
                InterviewQuestion q = InterviewQuestion.builder()
                        .session(saved)
                        .questionText(questionText)
                        .aiQuestionId(nextQ.has("id") ? nextQ.get("id").asText() : "")
                        .questionSource(QuestionSource.AI_GENERATED)
                        .jobRequirementTag(nextQ.has("topic") ? nextQ.get("topic").asText() : "")
                        .orderIndex(1)
                        .build();
                questionRepository.save(q);
                questions.add(q);
            }
            if (questions.isEmpty()) {
                throw new AppException("AI did not return the first interview question.");
            }
            return buildResponse(saved, questions);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in startSession", e);
            throw new AppException("Failed to start interview: " + e.getMessage());
        }
    }

    private String mapInterviewType(String type) {
        if (type == null || type.isBlank()) {
            return "Technical";
        }
        return switch (type.trim()) {
            case "HR Interview" -> "HR";
            case "Behavioral" -> "Behavioral";
            default -> type.trim();
        };
    }

    private String mapInterviewLevel(String level) {
        if (level == null || level.isBlank()) {
            return "Mid";
        }
        return switch (level.trim()) {
            case "Intern" -> "Intern";
            case "Fresher" -> "Junior";
            case "Junior" -> "Mid";
            default -> level.trim();
        };
    }

    @Transactional
    public SubmitAnswerResponse submitAnswer(UUID sessionId, String userEmail, SubmitAnswerRequest request) {
        InterviewSession session = findSession(sessionId, userEmail);

        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException("Question not found"));

        answerRepository.findFirstByQuestionId(question.getId()).ifPresent(answerRepository::delete);

        InterviewAnswer answer = InterviewAnswer.builder()
                .question(question)
                .answerText(request.getAnswerText())
                .audioStoragePath(request.getAudioStoragePath())
                .inputType(request.getInputType() != null ? request.getInputType() : InputType.TEXT)
                .durationSeconds(request.getDurationSeconds())
                .build();

        try {
            Map<String, Object> req = new HashMap<>();
            req.put("session_id", session.getAiSessionId());
            req.put("question_id", question.getAiQuestionId());
            req.put("user_answer", request.getAnswerText());

            String aiResponse = aiApiClient.submitAnswer(req);
            JsonNode resNode = objectMapper.readTree(aiResponse);

            if (resNode.has("evaluation") && !resNode.get("evaluation").isNull()) {
                JsonNode eval = resNode.get("evaluation");
                answer.setScore(eval.has("score") ? eval.get("score").asInt() : null);
                answer.setFeedback(eval.has("feedback") ? eval.get("feedback").asText() : null);
                answer.setImprovedAnswer(eval.has("improved_answer") ? eval.get("improved_answer").asText() : null);
                answer.setIsAnswerRelevant(
                        eval.has("is_answer_relevant") ? eval.get("is_answer_relevant").asBoolean() : null);

                if (eval.has("strengths") && eval.get("strengths").isArray()) {
                    List<String> strengths = new ArrayList<>();
                    eval.get("strengths").forEach(n -> strengths.add(n.asText()));
                    answer.setStrengths(strengths);
                }
                if (eval.has("weaknesses") && eval.get("weaknesses").isArray()) {
                    List<String> weaknesses = new ArrayList<>();
                    eval.get("weaknesses").forEach(n -> weaknesses.add(n.asText()));
                    answer.setWeaknesses(weaknesses);
                }
            }

            InterviewAnswer savedAnswer = answerRepository.save(answer);

            JsonNode nextQ = resNode.get("next_question");
            if (nextQ != null && !nextQ.isNull()) {
                saveAiQuestion(session, nextQ, (question.getOrderIndex() != null ? question.getOrderIndex() : 0) + 1);
            }
            return SubmitAnswerResponse.builder().answerId(savedAnswer.getId()).build();
        } catch (AiApiClient.AiProviderRateLimitException e) {
            log.warn("AI provider rate-limited while submitting answer for session {}. Saving answer and continuing with a predefined question.",
                    sessionId);
            answer.setFeedback("AI evaluation is temporarily unavailable because the AI provider is rate-limited. This answer was saved and can be reviewed later.");
            InterviewAnswer savedAnswer = answerRepository.save(answer);
            createFallbackQuestionIfNeeded(session, question, "AI provider rate-limited");
            return SubmitAnswerResponse.builder().answerId(savedAnswer.getId()).build();
        } catch (AiApiClient.AiProviderInvalidResponseException e) {
            log.warn("AI provider returned invalid answer response for session {}. Saving answer and continuing with a predefined question.",
                    sessionId);
            answer.setFeedback("AI evaluation is temporarily unavailable because the AI service returned an invalid response. This answer was saved and can be reviewed later.");
            InterviewAnswer savedAnswer = answerRepository.save(answer);
            createFallbackQuestionIfNeeded(session, question, "AI response invalid");
            return SubmitAnswerResponse.builder().answerId(savedAnswer.getId()).build();
        } catch (Exception e) {
            log.error("AI API Error", e);
            throw new AppException("Failed to communicate with AI API: " + e.getMessage());
        }
    }

    @Transactional
    public InterviewSessionResponse completeSession(UUID sessionId, String userEmail) {
        InterviewSession session = findSession(sessionId, userEmail);

        try {
            Map<String, Object> req = new HashMap<>();
            req.put("session_id", session.getAiSessionId());

            String aiResponse = aiApiClient.getSummary(req);
            JsonNode resNode = objectMapper.readTree(aiResponse);

            if (resNode.has("final_result") && !resNode.get("final_result").isNull()) {
                JsonNode finalRes = resNode.get("final_result");
                if (finalRes.has("overall_score")) {
                    session.setOverallScore(new BigDecimal(finalRes.get("overall_score").asText()));
                }
                if (finalRes.has("summary")) {
                    session.setSummaryText(finalRes.get("summary").asText());
                }
                if (finalRes.has("strengths") && finalRes.get("strengths").isArray()) {
                    List<String> list = new ArrayList<>();
                    finalRes.get("strengths").forEach(n -> list.add(n.asText()));
                    session.setStrengths(list);
                }
                if (finalRes.has("weaknesses") && finalRes.get("weaknesses").isArray()) {
                    List<String> list = new ArrayList<>();
                    finalRes.get("weaknesses").forEach(n -> list.add(n.asText()));
                    session.setWeaknesses(list);
                }
                if (finalRes.has("improvement_suggestions") && finalRes.get("improvement_suggestions").isArray()) {
                    List<String> str = new ArrayList<>();
                    finalRes.get("improvement_suggestions").forEach(n -> str.add(n.asText()));
                    session.setNextSteps(String.join("\n", str));
                }
            }

            session.setStatus(InterviewStatus.COMPLETED);
            session.setEndTime(LocalDateTime.now());
            InterviewSession saved = sessionRepository.save(session);

            List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
            return buildResponse(saved, questions);
        } catch (AiApiClient.AiProviderRateLimitException e) {
            log.warn("AI provider rate-limited while generating summary for session {}. Completing with partial summary.",
                    sessionId);
            return completeWithPartialSummary(session, sessionId,
                    "AI summary is temporarily unavailable because the AI provider is rate-limited. Your interview answers were saved.",
                    "AI_RATE_LIMITED");
        } catch (AiApiClient.AiProviderInvalidResponseException e) {
            log.warn("AI provider returned invalid summary response for session {}. Completing with partial summary.",
                    sessionId);
            return completeWithPartialSummary(session, sessionId,
                    "AI summary is temporarily unavailable because the AI service returned an invalid or incomplete response. Your interview answers were saved.",
                    "AI_INVALID_RESPONSE");
        } catch (Exception e) {
            log.warn("AI summary failed for session {}. Completing with partial summary: {}",
                    sessionId, e.getMessage());
            return completeWithPartialSummary(session, sessionId,
                    "AI summary is temporarily unavailable because the AI service returned an invalid or incomplete response. Your interview answers were saved.",
                    "AI_UNAVAILABLE");
        }
    }

    @Transactional
    public void deleteSession(UUID sessionId, String userEmail) {
        InterviewSession session = findSession(sessionId, userEmail);
        session.setDeletedAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public List<InterviewSessionResponse> getUserSessions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new AppException("User not found"));
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(s -> s.getDeletedAt() == null)
                .map(s -> buildResponse(s, Collections.emptyList()))
                .collect(Collectors.toList());
    }

    private InterviewSession findSession(UUID sessionId, String userEmail) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException("Session not found"));
        if (!session.getUser().getEmail().equals(userEmail)) {
            throw new AppException("Unauthorized");
        }
        return session;
    }

    private void saveAiQuestion(InterviewSession session, JsonNode nextQ, int orderIndex) {
        String questionText = nextQ.has("question_text") ? nextQ.get("question_text").asText() : "";
        if (questionText.isBlank()) {
            return;
        }
        InterviewQuestion q = InterviewQuestion.builder()
                .session(session)
                .questionText(questionText)
                .aiQuestionId(nextQ.has("id") ? nextQ.get("id").asText() : "")
                .questionSource(QuestionSource.AI_GENERATED)
                .jobRequirementTag(nextQ.has("topic") ? nextQ.get("topic").asText() : "")
                .orderIndex(orderIndex)
                .build();
        questionRepository.save(q);
    }

    private void createFallbackQuestionIfNeeded(InterviewSession session, InterviewQuestion answeredQuestion, String reason) {
        int currentIndex = answeredQuestion.getOrderIndex() != null ? answeredQuestion.getOrderIndex() : 1;
        if (currentIndex >= 5) {
            return;
        }

        int nextIndex = currentIndex + 1;
        String questionText = fallbackQuestionText(nextIndex);
        InterviewQuestion q = InterviewQuestion.builder()
                .session(session)
                .questionText(questionText)
                .aiQuestionId("degraded-fallback-q" + nextIndex)
                .questionSource(QuestionSource.PRE_DEFINED)
                .jobRequirementTag(reason)
                .orderIndex(nextIndex)
                .build();
        questionRepository.save(q);
    }

    private String fallbackQuestionText(int orderIndex) {
        return switch (orderIndex) {
            case 2 -> "Describe a project or responsibility from your CV that best matches this role. What was your specific contribution?";
            case 3 -> "Tell me about a difficult technical or workplace problem you handled. How did you approach it and what was the result?";
            case 4 -> "Which skill from your CV would you most want to demonstrate in this position, and how have you applied it in practice?";
            case 5 -> "What would you improve in your previous work if you had more time or resources, and why?";
            default -> "Tell me about your background and how it relates to this role.";
        };
    }

    private InterviewSessionResponse completeWithPartialSummary(InterviewSession session, UUID sessionId, String message, String aiStatus) {
        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        List<InterviewAnswer> answers = answerRepository.findAll().stream()
                .filter(answer -> answer.getQuestion() != null
                        && answer.getQuestion().getSession() != null
                        && sessionId.equals(answer.getQuestion().getSession().getId()))
                .toList();

        answers.stream()
                .map(InterviewAnswer::getScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .ifPresent(avg -> session.setOverallScore(BigDecimal.valueOf(Math.round(avg * 100.0) / 100.0)));

        session.setSummaryText(message);
        if (session.getStrengths() == null || session.getStrengths().isEmpty()) {
            session.setStrengths(List.of("Interview answers were recorded successfully."));
        }
        if (session.getWeaknesses() == null || session.getWeaknesses().isEmpty()) {
            session.setWeaknesses(List.of("AI-generated detailed feedback is unavailable for this attempt."));
        }
        session.setNextSteps(aiStatus + ": Retry the interview summary later after the AI provider is available, or review the saved answers manually.");
        session.setStatus(InterviewStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());

        InterviewSession saved = sessionRepository.save(session);
        return buildResponse(saved, questions);
    }

    private InterviewSessionResponse buildResponse(InterviewSession session, List<InterviewQuestion> questions) {
        Map<UUID, InterviewAnswer> answersByQuestionId = answerRepository.findByQuestionSessionId(session.getId()).stream()
                .filter(answer -> answer.getQuestion() != null)
                .collect(Collectors.toMap(answer -> answer.getQuestion().getId(), answer -> answer, (first, second) -> second));
        Map<UUID, List<InterviewRecording>> recordingsByQuestionId = recordingRepository
                .findBySessionIdAndDeletedAtIsNullOrderByCreatedAtAsc(session.getId())
                .stream()
                .filter(recording -> recording.getQuestion() != null)
                .collect(Collectors.groupingBy(recording -> recording.getQuestion().getId()));

        List<InterviewQuestionResponse> qDtos = questions.stream()
                .map(q -> InterviewQuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionSource(q.getQuestionSource())
                        .jobRequirementTag(q.getJobRequirementTag())
                        .orderIndex(q.getOrderIndex())
                        .createdAt(q.getCreatedAt())
                        .answer(toAnswerResponse(answersByQuestionId.get(q.getId())))
                        .recordings(recordingsByQuestionId.getOrDefault(q.getId(), Collections.emptyList()).stream()
                                .map(interviewRecordingService::toResponse)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return InterviewSessionResponse.builder()
                .id(session.getId())
                .status(session.getStatus())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .overallScore(session.getOverallScore())
                .strengths(session.getStrengths())
                .weaknesses(session.getWeaknesses())
                .summaryText(session.getSummaryText())
                .nextSteps(session.getNextSteps())
                .aiStatus(resolveAiStatus(session, questions))
                .aiMessage(resolveAiMessage(session, questions))
                .createdAt(session.getCreatedAt())
                .questions(qDtos)
                .build();
    }

    private InterviewAnswerResponse toAnswerResponse(InterviewAnswer answer) {
        if (answer == null) {
            return null;
        }
        return InterviewAnswerResponse.builder()
                .id(answer.getId())
                .questionId(answer.getQuestion() != null ? answer.getQuestion().getId() : null)
                .answerText(answer.getAnswerText())
                .audioStoragePath(answer.getAudioStoragePath())
                .durationSeconds(answer.getDurationSeconds())
                .inputType(answer.getInputType())
                .score(answer.getScore())
                .feedback(answer.getFeedback())
                .strengths(answer.getStrengths())
                .weaknesses(answer.getWeaknesses())
                .improvedAnswer(answer.getImprovedAnswer())
                .isAnswerRelevant(answer.getIsAnswerRelevant())
                .createdAt(answer.getCreatedAt())
                .build();
    }

    private String resolveAiStatus(InterviewSession session, List<InterviewQuestion> questions) {
        if (questions.stream().anyMatch(q -> q.getQuestionSource() == QuestionSource.PRE_DEFINED)) {
            return "DEGRADED";
        }
        if (session.getNextSteps() != null && session.getNextSteps().startsWith("AI_")) {
            return "DEGRADED";
        }
        return "OK";
    }

    private String resolveAiMessage(InterviewSession session, List<InterviewQuestion> questions) {
        if (session.getNextSteps() != null && session.getNextSteps().startsWith("AI_")) {
            return session.getSummaryText();
        }
        boolean hasFallbackQuestion = questions.stream().anyMatch(q -> q.getQuestionSource() == QuestionSource.PRE_DEFINED);
        if (hasFallbackQuestion) {
            return "AI provider was temporarily unavailable for one or more turns, so predefined backup questions were used.";
        }
        return null;
    }
}
