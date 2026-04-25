package com.aiinterview.backend.controller;

import com.aiinterview.backend.dto.CvUploadDto;
import com.aiinterview.backend.entity.CvUpload;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.CvUploadRepository;
import com.aiinterview.backend.repository.UserRepository;
import com.aiinterview.backend.service.FileService;
import com.aiinterview.backend.service.UserPrincipal;
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

    @PostMapping("/upload")
    public ResponseEntity<CvUploadDto> uploadCv(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Single CV logic: Delete all existing CVs for this user before uploading new one
        List<CvUpload> existingCvs = cvUploadRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);
        for (CvUpload oldCv : existingCvs) {
            // Delete from Supabase storage
            fileService.delete(oldCv.getStoragePath());
            
            // Soft delete in database
            oldCv.setDeletedAt(LocalDateTime.now());
            oldCv.setIsCurrent(false);
            cvUploadRepository.save(oldCv);
        }

        // Upload to Supabase
        String storageUrl = fileService.saveCv(file);

        CvUpload cvUpload = CvUpload.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .storagePath(storageUrl)
                .fileSize((int) file.getSize())
                .mimeType(file.getContentType())
                .isCurrent(true)
                .parseStatus("pending")
                .build();

        CvUpload saved = cvUploadRepository.save(cvUpload);

        return ResponseEntity.ok(mapToDto(saved));
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

        if (target == null) throw new RuntimeException("CV not found");

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
                .createdAt(cv.getCreatedAt())
                .build();
    }
}
