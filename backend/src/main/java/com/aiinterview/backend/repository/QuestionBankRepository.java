package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Integer>, JpaSpecificationExecutor<QuestionBank> {
}
