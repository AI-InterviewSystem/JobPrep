package com.aiinterview.backend.service;

import com.aiinterview.backend.dto.CvParsedDataResponse;
import com.aiinterview.backend.entity.CvUpload;
import com.aiinterview.backend.entity.User;
import com.aiinterview.backend.repository.CvUploadRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvUploadService {

    private final CvUploadRepository cvUploadRepository;
    private final ObjectMapper objectMapper;

    public CvParsedDataResponse getCurrentParsedData(User user) {
        Optional<CvUpload> cvOpt = findCurrentCv(user);
        if (cvOpt.isEmpty()) {
            return CvParsedDataResponse.builder()
                    .parseStatus("none")
                    .cvData(new HashMap<>())
                    .build();
        }

        CvUpload cv = cvOpt.get();
        return CvParsedDataResponse.builder()
                .parseStatus(cv.getParseStatus())
                .cvData(extractCvDataMap(cv))
                .build();
    }

    public Map<String, Object> getCvDataForAi(User user) {
        return findCurrentCv(user)
                .map(this::extractCvDataMap)
                .orElseGet(HashMap::new);
    }

    private Optional<CvUpload> findCurrentCv(User user) {
        Optional<CvUpload> currentCv = cvUploadRepository.findByUserAndIsCurrentTrueAndDeletedAtIsNull(user);
        if (currentCv.isPresent()) {
            return currentCv;
        }
        List<CvUpload> cvs = cvUploadRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user);
        return cvs.isEmpty() ? Optional.empty() : Optional.of(cvs.get(0));
    }

    private Map<String, Object> extractCvDataMap(CvUpload cv) {
        if (cv.getParsedData() == null) {
            return new HashMap<>();
        }
        try {
            JsonNode cvDataNode = objectMapper.readTree(cv.getParsedData());
            if (cvDataNode.has("data") && !cvDataNode.get("data").isNull()) {
                return objectMapper.convertValue(cvDataNode.get("data"), Map.class);
            }
            return objectMapper.convertValue(cvDataNode, Map.class);
        } catch (Exception e) {
            log.warn("Could not parse CV data: {}", e.getMessage());
            return new HashMap<>();
        }
    }
}
