package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.ProductStatus;
import com.ecommerce.marketplace_api.model.SellerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySeller(SellerProfile seller);
    List<Product> findBySellerAndStatus(SellerProfile seller, ProductStatus status);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByStatus(ProductStatus status);
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    boolean existsBySlug(String slug);
    long countByStatus(ProductStatus status);
}