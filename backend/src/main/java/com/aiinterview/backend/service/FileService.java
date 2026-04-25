package com.aiinterview.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class FileService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    @Value("${supabase.bucket.avatar}")
    private String avatarBucket;

    @Value("${supabase.bucket.cvs}")
    private String cvBucket;

    private final RestTemplate restTemplate = new RestTemplate();

    public String save(MultipartFile file) {
        return saveToBucket(file, avatarBucket);
    }

    public String saveCv(MultipartFile file) {
        return saveToBucket(file, cvBucket);
    }

    private String saveToBucket(MultipartFile file, String targetBucket) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + targetBucket + "/" + filename;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            headers.setContentType(MediaType.parseMediaType(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return supabaseUrl + "/storage/v1/object/public/" + targetBucket + "/" + filename;
            } else {
                throw new RuntimeException("Failed to upload to Supabase: " + response.getBody());
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new RuntimeException("Supabase upload failed: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    public void delete(String storagePath) {
        // storagePath is expected to be something like "public/cvs/uuid.pdf" or the full URL
        // We need to extract the path within the bucket or handle the URL
        try {
            String relativePath = storagePath;
            if (storagePath.contains("/storage/v1/object/public/")) {
                // Extract bucket/filename from URL
                String parts[] = storagePath.split("/storage/v1/object/public/");
                if (parts.length > 1) {
                    relativePath = parts[1];
                }
            }

            String deleteUrl = supabaseUrl + "/storage/v1/object/" + relativePath;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, String.class);
        } catch (Exception e) {
            // Log and ignore or throw
            System.err.println("Failed to delete file from Supabase: " + e.getMessage());
        }
    }
}

