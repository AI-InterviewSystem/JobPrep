package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.FeedbackHistoryResponse;
import com.aiinterview.backend.dto.FeedbackRequest;
import com.aiinterview.backend.dto.FeedbackResponse;
import com.aiinterview.backend.dto.FeedbackStatusUpdateRequest;
import com.aiinterview.backend.entity.Feedback;
import com.aiinterview.backend.entity.FeedbackHistory;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.FeedbackHistoryRepository;
import com.aiinterview.backend.repository.FeedbackRepository;
import com.aiinterview.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackHistoryRepository historyRepository;
    private final UserRepository userRepository;

    @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found"));

        Feedback feedback = Feedback.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .attachmentUrl(request.getAttachmentUrl())
                .type(request.getType() != null ? request.getType() : Feedback.FeedbackType.OTHER)
                .status(Feedback.Status.PENDING)
                .user(user)
                .build();

        return mapToResponse(feedbackRepository.save(feedback));
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getMyFeedbacks(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found"));

        return feedbackRepository.findAllByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeedbackResponse updateFeedbackStatus(UUID feedbackId, FeedbackStatusUpdateRequest request,
            String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new AppException("Admin not found"));

        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException("Feedback not found"));

        Feedback.Status oldStatus = feedback.getStatus();
        Feedback.Status newStatus = request.getStatus();

        if (oldStatus != newStatus || (request.getNote() != null && !request.getNote().isEmpty())) {
            feedback.setStatus(newStatus);
            feedback = feedbackRepository.save(feedback);

            FeedbackHistory history = FeedbackHistory.builder()
                    .feedback(feedback)
                    .changedBy(admin)
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .internalNote(request.getNote())
                    .build();
            historyRepository.save(history);
        }

        return mapToResponse(feedback);
    }

    @Transactional(readOnly = true)
    public List<FeedbackHistoryResponse> getFeedbackHistory(UUID feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException("Feedback not found"));

        return historyRepository.findAllByFeedbackOrderByCreatedAtDesc(feedback)
                .stream()
                .map(history -> FeedbackHistoryResponse.builder()
                        .id(history.getId())
                        .changedByEmail(history.getChangedBy().getEmail())
                        .changedByName(history.getChangedBy().getProfile() != null
                                ? history.getChangedBy().getProfile().getFullName()
                                : "Admin")
                        .oldStatus(history.getOldStatus())
                        .newStatus(history.getNewStatus())
                        .internalNote(history.getInternalNote())
                        .createdAt(history.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .title(feedback.getTitle())
                .content(feedback.getContent())
                .attachmentUrl(feedback.getAttachmentUrl())
                .status(feedback.getStatus())
                .type(feedback.getType())
                .userEmail(feedback.getUser().getEmail())
                .userName(feedback.getUser().getProfile() != null ? feedback.getUser().getProfile().getFullName()
                        : "User")
                .createdAt(feedback.getCreatedAt())
                .updatedAt(feedback.getUpdatedAt())
                .build();
    }
}
