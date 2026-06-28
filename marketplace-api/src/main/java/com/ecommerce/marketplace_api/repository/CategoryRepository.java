package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    List<Category> findByParentIsNull();
    
    List<Category> findByParentId(Long parentId);
    
    boolean existsBySlug(String slug);
    
    // ✅ ADD THIS METHOD
    Optional<Category> findByName(String name);
    
    // Optional: Add this for active categories if needed
    List<Category> findByIsActiveTrue();
}