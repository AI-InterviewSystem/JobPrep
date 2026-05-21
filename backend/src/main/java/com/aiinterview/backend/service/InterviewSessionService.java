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
    private final UserRepository userRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final CvUploadRepository cvUploadRepository;
    private final AiApiClient aiApiClient;
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
    public InterviewSessionResponse startSession(UUID sessionId, String userEmail) {
        InterviewSession session = findSession(sessionId, userEmail);
        User user = session.getUser();

        List<CvUpload> cvs = cvUploadRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);
        if (cvs.isEmpty() || cvs.get(0).getParsedData() == null) {
            throw new AppException("Please upload and let AI extract your CV before starting.");
        }
        CvUpload latestCv = cvs.get(0);

        try {
            JsonNode cvDataNode = objectMapper.readTree(latestCv.getParsedData());
            if (cvDataNode.has("data")) {
                cvDataNode = cvDataNode.get("data");
            }

            Map<String, Object> req = new HashMap<>();
            req.put("cv_data", cvDataNode);
            if (session.getJobDescription() != null) {
                req.put("job_description", session.getJobDescription().getJobDescriptionText());
            } else {
                req.put("job_description", "General technical interview.");
            }
            req.put("interview_type", "Technical");
            req.put("interview_level", "Mid");
            req.put("num_questions", 5);
            req.put("passing_score", 0);

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
                InterviewQuestion q = InterviewQuestion.builder()
                        .session(saved)
                        .questionText(nextQ.has("question_text") ? nextQ.get("question_text").asText() : "")
                        .aiQuestionId(nextQ.has("id") ? nextQ.get("id").asText() : "")
                        .questionSource(QuestionSource.AI_GENERATED)
                        .jobRequirementTag(nextQ.has("topic") ? nextQ.get("topic").asText() : "")
                        .orderIndex(1)
                        .build();
                questionRepository.save(q);
                questions.add(q);
            }
            return buildResponse(saved, questions);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("AI API Error", e);
            throw new AppException("Failed to communicate with AI API: " + e.getMessage());
        }
    }

    @Transactional
    public void submitAnswer(UUID sessionId, String userEmail, SubmitAnswerRequest request) {
        InterviewSession session = findSession(sessionId, userEmail);

        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException("Question not found"));

        answerRepository.findAll().stream()
                .filter(a -> a.getQuestion().getId().equals(question.getId()))
                .findFirst()
                .ifPresent(answerRepository::delete);

        InterviewAnswer answer = InterviewAnswer.builder()
                .question(question)
                .answerText(request.getAnswerText())
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

            answerRepository.save(answer);

            JsonNode nextQ = resNode.get("next_question");
            if (nextQ != null && !nextQ.isNull()) {
                InterviewQuestion q = InterviewQuestion.builder()
                        .session(session)
                        .questionText(nextQ.has("question_text") ? nextQ.get("question_text").asText() : "")
                        .aiQuestionId(nextQ.has("id") ? nextQ.get("id").asText() : "")
                        .questionSource(QuestionSource.AI_GENERATED)
                        .jobRequirementTag(nextQ.has("topic") ? nextQ.get("topic").asText() : "")
                        .orderIndex((question.getOrderIndex() != null ? question.getOrderIndex() : 0) + 1)
                        .build();
                questionRepository.save(q);
            }
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
        } catch (Exception e) {
            log.error("AI API Error", e);
            throw new AppException("Failed to communicate with AI API for summary: " + e.getMessage());
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

    private InterviewSessionResponse buildResponse(InterviewSession session, List<InterviewQuestion> questions) {
        List<InterviewQuestionResponse> qDtos = questions.stream()
                .map(q -> InterviewQuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .questionSource(q.getQuestionSource())
                        .jobRequirementTag(q.getJobRequirementTag())
                        .orderIndex(q.getOrderIndex())
                        .createdAt(q.getCreatedAt())
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
                .createdAt(session.getCreatedAt())
                .questions(qDtos)
                .build();
    }
}
