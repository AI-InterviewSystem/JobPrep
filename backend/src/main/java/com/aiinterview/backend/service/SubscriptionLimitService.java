package com.aiinterview.backend.service;

import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.entity.UserSubscription;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.InterviewSessionRepository;
import com.aiinterview.backend.repository.PracticeAnswerRepository;
import com.aiinterview.backend.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionLimitService {

    private final UserSubscriptionRepository subscriptionRepository;
    private final InterviewSessionRepository interviewSessionRepository;
    private final PracticeAnswerRepository practiceAnswerRepository;

    @Transactional(readOnly = true)
    public void checkMockInterviewLimit(User user) {
        UserSubscription activeSub = getActiveSubscription(user);
        
        if (activeSub != null) {
            Integer remaining = activeSub.getRemainingInterviews();
            // -1 represents unlimited
            if (remaining != null && remaining == -1) {
                return;
            }
            if (remaining != null && remaining <= 0) {
                throw new AppException("You have reached your mock interview limit for this billing cycle. Please upgrade your plan for more.");
            }
        } else {
            // Free plan logic: 2 mock interviews per calendar month
            LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            long countThisMonth = interviewSessionRepository.countByUserIdAndCreatedAtGreaterThanEqualAndDeletedAtIsNull(user.getId(), startOfMonth);
            if (countThisMonth >= 2) {
                throw new AppException("Free plan allows a maximum of 2 mock interviews per month. Please upgrade your plan for more.");
            }
        }
    }

    @Transactional
    public void decrementMockInterview(User user) {
        UserSubscription activeSub = getActiveSubscription(user);
        if (activeSub != null) {
            Integer remaining = activeSub.getRemainingInterviews();
            if (remaining != null && remaining > 0) {
                activeSub.setRemainingInterviews(remaining - 1);
                subscriptionRepository.save(activeSub);
            }
        }
    }

    @Transactional(readOnly = true)
    public void checkPracticeQuestionLimit(User user) {
        UserSubscription activeSub = getActiveSubscription(user);
        
        if (activeSub != null) {
            // Basic and Premium have unlimited practice questions
            return;
        } else {
            // Free plan logic: 10 practice questions per calendar month
            LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            long countThisMonth = practiceAnswerRepository.countByPracticeSessionUserIdAndAnsweredAtGreaterThanEqual(user.getId(), startOfMonth);
            if (countThisMonth >= 10) {
                throw new AppException("Free plan allows practicing a maximum of 10 questions per month. Please upgrade your plan for unlimited access.");
            }
        }
    }

    private UserSubscription getActiveSubscription(User user) {
        return subscriptionRepository.findCurrentActiveByUserEmail(
                user.getEmail(),
                List.of(UserSubscription.Status.ACTIVE, UserSubscription.Status.ACTIVE_NON_RENEWING),
                LocalDateTime.now(),
                PageRequest.of(0, 1)
        ).stream().findFirst().orElse(null);
    }
}
