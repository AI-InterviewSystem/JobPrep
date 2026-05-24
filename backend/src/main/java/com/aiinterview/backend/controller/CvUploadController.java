package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.CvParsedDataResponse;
import com.aiinterview.backend.dto.CvUploadDto;
import com.aiinterview.backend.entity.CvUpload;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.CvUploadRepository;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.service.FileService;
import com.aiinterview.backend.service.UserPrincipal;
import com.aiinterview.backend.service.AiApiClient;
import com.aiinterview.backend.service.CvUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cvs")
@RequiredArgsConstructor
public class CvUploadController {

    private final CvUploadRepository cvUploadRepository;
    private final UserRepository userRepository;
    private final FileService fileService;
    private final AiApiClient aiApiClient;
    private final CvUploadService cvUploadService;

    @PostMapping("/upload")
    public ResponseEntity<CvUploadDto> uploadCv(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("Uploaded file is empty");
        }

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (Exception e) {
            throw new RuntimeException("Could not read uploaded file", e);
        }

        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType() != null ? file.getContentType() : "application/pdf";

        // Single CV logic: Delete all existing CVs for this user before uploading new one
        List<CvUpload> existingCvs = cvUploadRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);
        for (CvUpload oldCv : existingCvs) {
            fileService.delete(oldCv.getStoragePath());
            oldCv.setDeletedAt(LocalDateTime.now());
            oldCv.setIsCurrent(false);
            cvUploadRepository.save(oldCv);
        }

        String storageUrl = fileService.saveCv(fileBytes, originalFilename, contentType);

        CvUpload cvUpload = CvUpload.builder()
                .user(user)
                .fileName(originalFilename)
                .storagePath(storageUrl)
                .fileSize(fileBytes.length)
                .mimeType(contentType)
                .isCurrent(true)
                .parseStatus("pending")
                .build();

        CvUpload saved = cvUploadRepository.save(cvUpload);

        try {
            String aiResult = aiApiClient.extractCv(fileBytes, originalFilename, contentType);
            saved.setParsedData(aiResult);
            saved.setParseStatus("completed");
        } catch (Exception e) {
            String errorMsg = e.getMessage();
            saved.setRawText(truncateError(errorMsg));
            saved.setParseStatus("failed");
        }

        saved = cvUploadRepository.save(saved);

        return ResponseEntity.ok(mapToDto(saved));
    }

    @GetMapping("/current/parsed-data")
    public ResponseEntity<CvParsedDataResponse> getCurrentParsedData(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(cvUploadService.getCurrentParsedData(user));
    }

    @GetMapping
    public ResponseEntity<List<CvUploadDto>> getMyCvs(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CvUpload> cvs = cvUploadRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(cvs.stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCv(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CvUpload cv = cvUploadRepository.findByIdAndUserAndDeletedAtIsNull(id, user)
                .orElseThrow(() -> new RuntimeException("CV not found"));

        cv.setDeletedAt(LocalDateTime.now());
        cv.setIsCurrent(false);
        cvUploadRepository.save(cv);

        // Optionally delete from storage too if you want hard delete from bucket
        // fileService.delete(cv.getStoragePath());

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/set-current")
    public ResponseEntity<CvUploadDto> setCurrentCv(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CvUpload> cvs = cvUploadRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);

        CvUpload target = null;
        for (CvUpload cv : cvs) {
            if (cv.getId().equals(id)) {
                cv.setIsCurrent(true);
                target = cv;
            } else {
                cv.setIsCurrent(false);
            }
            cvUploadRepository.save(cv);
        }

        if (target == null)
            throw new RuntimeException("CV not found");

        return ResponseEntity.ok(mapToDto(target));
    }

    private CvUploadDto mapToDto(CvUpload cv) {
        return CvUploadDto.builder()
                .id(cv.getId())
                .fileName(cv.getFileName())
                .storagePath(cv.getStoragePath())
                .fileSize(cv.getFileSize())
                .mimeType(cv.getMimeType())
                .isCurrent(cv.getIsCurrent())
                .parseStatus(cv.getParseStatus())
                .parseError("failed".equals(cv.getParseStatus()) ? cv.getRawText() : null)
                .createdAt(cv.getCreatedAt())
                .build();
    }

    private String truncateError(String errorMsg) {
        if (errorMsg == null) {
            return "Unknown AI parsing error";
        }
        return errorMsg.length() > 500 ? errorMsg.substring(0, 500) : errorMsg;
    }
}
