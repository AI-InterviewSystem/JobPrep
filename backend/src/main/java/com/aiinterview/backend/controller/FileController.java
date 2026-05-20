package com.aiinterview.backend.controller;

import com.aiinterview.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        String url;
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();

        if ((contentType != null && contentType.toLowerCase().contains("pdf")) ||
                (filename != null && filename.toLowerCase().endsWith(".pdf"))) {
            url = fileService.saveCv(file);
        } else {
            url = fileService.save(file);
        }

        return ResponseEntity.ok(Map.of("url", url));
    }
}
