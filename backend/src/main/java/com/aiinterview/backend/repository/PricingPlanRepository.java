package com.aiinterview.backend.repository;

import com.aiinterview.backend.entity.PricingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PricingPlanRepository extends JpaRepository<PricingPlan, Long> {
    
    List<PricingPlan> findByDeletedAtIsNullOrderByIdAsc();
    
    List<PricingPlan> findByIsActiveTrueAndDeletedAtIsNullOrderByIdAsc();
    
    Optional<PricingPlan> findByIdAndDeletedAtIsNull(Long id);
}
