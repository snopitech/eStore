package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNull();
    List<Category> findByParentId(Long parentId);
    boolean existsBySlug(String slug);
}