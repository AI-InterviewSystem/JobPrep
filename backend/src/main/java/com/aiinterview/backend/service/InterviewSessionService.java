package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.*;
import com.aiinterview.backend.entity.*;
import com.aiinterview.backend.entity.InterviewAnswer.InputType;
import com.aiinterview.backend.entity.InterviewSession.InterviewStatus;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewSessionService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final JobDescriptionRepository jobDescriptionRepository;

    // ---- MOCK AI question bank by level/type ----
    private static final Map<String, List<String>> QUESTION_BANK = new LinkedHashMap<>();
    static {
        QUESTION_BANK.put("default", Arrays.asList(
            "Tell me about yourself and your professional background.",
            "What are your greatest strengths and how do they contribute to your work?",
            "Describe a challenging project you've worked on and how you handled it.",
            "How do you prioritize tasks when working under tight deadlines?",
            "Tell me about a time you had to work with a difficult team member. How did you handle it?",
            "Where do you see yourself in five years?",
            "What motivates you in your work?",
            "Describe a situation where you had to learn a new skill quickly.",
            "How do you handle constructive criticism?",
            "Why are you interested in this role and our company?"
        ));
        QUESTION_BANK.put("technical", Arrays.asList(
            "Explain the difference between REST and GraphQL APIs.",
            "What is dependency injection and why is it useful?",
            "Describe SOLID principles and give an example of each.",
            "What is the difference between SQL and NoSQL databases?",
            "Explain the concept of microservices architecture.",
            "How would you handle authentication and authorization in a web application?",
            "What is CI/CD and how does it benefit a software project?",
            "Describe your approach to writing unit tests.",
            "What are the trade-offs between synchronous and asynchronous processing?",
            "How do you ensure the security of user data in your applications?"
        ));
        QUESTION_BANK.put("hr", Arrays.asList(
            "Tell me about yourself.",
            "Why do you want to work at our company?",
            "What are your salary expectations?",
            "Describe your ideal work environment.",
            "How do you handle stress and pressure?",
            "What is your greatest professional achievement?",
            "Why are you leaving your current position?",
            "How do you stay up-to-date with industry trends?",
            "Describe your management style.",
            "What are your long-term career goals?"
        ));
    }

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

        // Mock: generate 10 questions
        List<String> pool = QUESTION_BANK.getOrDefault("default", new ArrayList<>());
        List<String> shuffled = new ArrayList<>(pool);
        Collections.shuffle(shuffled);
        List<String> selected = shuffled.subList(0, Math.min(10, shuffled.size()));

        List<InterviewQuestion> questions = new ArrayList<>();
        for (int i = 0; i < selected.size(); i++) {
            InterviewQuestion q = InterviewQuestion.builder()
                    .session(saved)
                    .questionText(selected.get(i))
                    .questionSource(QuestionSource.AI_GENERATED)
                    .orderIndex(i + 1)
                    .build();
            questions.add(q);
        }
        questionRepository.saveAll(questions);

        return buildResponse(saved, questions);
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
        session.setStatus(InterviewStatus.IN_PROGRESS);
        session.setStartTime(LocalDateTime.now());
        InterviewSession saved = sessionRepository.save(session);
        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);
        return buildResponse(saved, questions);
    }

    @Transactional
    public void submitAnswer(UUID sessionId, String userEmail, SubmitAnswerRequest request) {
        findSession(sessionId, userEmail); // verify ownership

        InterviewQuestion question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new AppException("Question not found"));

        // Remove old answer if resubmitting
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

        answerRepository.save(answer);
    }

    @Transactional
    public InterviewSessionResponse completeSession(UUID sessionId, String userEmail) {
        InterviewSession session = findSession(sessionId, userEmail);
        List<InterviewQuestion> questions = questionRepository.findBySessionIdOrderByOrderIndexAsc(sessionId);

        // Mock AI evaluation
        BigDecimal score = BigDecimal.valueOf(70 + Math.random() * 25).setScale(2, java.math.RoundingMode.HALF_UP);

        List<String> strengths = Arrays.asList(
            "Clear and structured communication",
            "Good technical knowledge foundation",
            "Positive attitude and eagerness to learn"
        );
        List<String> weaknesses = Arrays.asList(
            "Could provide more specific examples",
            "Some answers lacked quantifiable results",
            "Consider expanding on problem-solving methodology"
        );

        session.setStatus(InterviewStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());
        session.setOverallScore(score);
        session.setStrengths(strengths);
        session.setWeaknesses(weaknesses);
        session.setSummaryText("You demonstrated a solid understanding of core concepts with good communication skills. Your responses showed enthusiasm and relevant experience. To further improve, focus on providing specific, quantifiable examples using the STAR method (Situation, Task, Action, Result).");
        session.setNextSteps("1. Practice the STAR method for behavioral questions.\n2. Review system design concepts.\n3. Prepare 3-5 specific examples of past achievements.\n4. Research industry trends relevant to your target role.");

        InterviewSession saved = sessionRepository.save(session);
        return buildResponse(saved, questions);
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

    // ---- Helpers ----
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
