package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.InterviewRecordingResponse;
import com.aiinterview.backend.entity.*;
import com.aiinterview.backend.exception.AppException;
import com.aiinterview.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewRecordingService {

    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewRecordingRepository recordingRepository;
    private final FileService fileService;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Transactional
    public InterviewRecordingResponse uploadRecording(
            UUID sessionId,
            String userEmail,
            UUID questionId,
            UUID answerId,
            String recordingType,
            Integer durationSeconds,
            String transcriptText,
            MultipartFile file
    ) {
        InterviewSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new AppException("Session not found"));
        if (!session.getUser().getEmail().equals(userEmail)) {
            throw new AppException("Unauthorized");
        }

        InterviewQuestion question = questionRepository.findById(questionId)
                .orElseThrow(() -> new AppException("Question not found"));
        if (question.getSession() == null || !sessionId.equals(question.getSession().getId())) {
            throw new AppException("Question does not belong to this session");
        }

        InterviewAnswer answer = null;
        if (answerId != null) {
            answer = answerRepository.findById(answerId)
                    .orElseThrow(() -> new AppException("Answer not found"));
            if (answer.getQuestion() == null || !questionId.equals(answer.getQuestion().getId())) {
                throw new AppException("Answer does not belong to this question");
            }
        }

        String normalizedType = normalizeRecordingType(recordingType, file.getContentType());
        FileService.StoredFile storedFile = fileService.saveInterviewRecording(file, sessionId, questionId);

        InterviewRecording recording = InterviewRecording.builder()
                .session(session)
                .question(question)
                .answer(answer)
                .user(session.getUser())
                .recordingType(normalizedType)
                .provider("supabase")
                .bucketName(storedFile.bucketName())
                .filePath(storedFile.filePath())
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .durationSeconds(durationSeconds)
                .transcriptText(transcriptText)
                .processingStatus("uploaded")
                .build();

        return toResponse(recordingRepository.save(recording));
    }

    public InterviewRecordingResponse toResponse(InterviewRecording recording) {
        String publicUrl = supabaseUrl + "/storage/v1/object/public/"
                + recording.getBucketName() + "/" + recording.getFilePath();
        return InterviewRecordingResponse.builder()
                .id(recording.getId())
                .sessionId(recording.getSession() != null ? recording.getSession().getId() : null)
                .questionId(recording.getQuestion() != null ? recording.getQuestion().getId() : null)
                .answerId(recording.getAnswer() != null ? recording.getAnswer().getId() : null)
                .recordingType(recording.getRecordingType())
                .provider(recording.getProvider())
                .bucketName(recording.getBucketName())
                .filePath(recording.getFilePath())
                .publicUrl(publicUrl)
                .mimeType(recording.getMimeType())
                .fileSize(recording.getFileSize())
                .durationSeconds(recording.getDurationSeconds())
                .transcriptText(recording.getTranscriptText())
                .processingStatus(recording.getProcessingStatus())
                .createdAt(recording.getCreatedAt())
                .build();
    }

    private String normalizeRecordingType(String recordingType, String mimeType) {
        String value = recordingType;
        if (value == null || value.isBlank()) {
            value = mimeType != null && mimeType.toLowerCase().startsWith("video/") ? "video" : "audio";
        }
        value = value.trim().toLowerCase();
        if (!value.equals("audio") && !value.equals("video")) {
            throw new AppException("Recording type must be audio or video");
        }
        return value;
    }
}
