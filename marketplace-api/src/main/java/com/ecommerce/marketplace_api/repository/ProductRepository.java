package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.ProductStatus;
import com.ecommerce.marketplace_api.model.SellerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // ===== BASIC QUERIES =====
    
    List<Product> findBySeller(SellerProfile seller);
    
    List<Product> findBySellerAndStatus(SellerProfile seller, ProductStatus status);
    
    List<Product> findByCategoryId(Long categoryId);
    
    List<Product> findByStatus(ProductStatus status);
    
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    
    boolean existsBySlug(String slug);
    
    long countByStatus(ProductStatus status);
    
    // ===== FIND PRODUCTS BY SELLER (already exists) =====
    List<Product> findBySellerAndIsLiveTrue(SellerProfile seller);
    
    // ===== COUNT LIVE PRODUCTS BY SELLER =====
    @Query("SELECT COUNT(p) FROM Product p WHERE p.isLive = true AND p.seller = :seller")
    long countLiveProductsBySeller(@Param("seller") SellerProfile seller);
    
    // ===== FIND ALL CURRENTLY LIVE PRODUCTS =====
    @Query("SELECT p FROM Product p WHERE p.isLive = true AND (p.liveEndTime IS NULL OR p.liveEndTime > CURRENT_TIMESTAMP) ORDER BY p.liveStartTime DESC")
    List<Product> findCurrentlyLiveProducts();
    
    // ===== FIND LIVE PRODUCTS WITH VIEWER COUNT =====
    @Query("SELECT p, COALESCE(SUM(p.viewerCount), 0) FROM Product p WHERE p.isLive = true GROUP BY p.id ORDER BY p.liveStartTime DESC")
    List<Object[]> findLiveProductsWithViewerCount();
    
    // ===== INCREMENT VIEWER COUNT =====
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.viewerCount = p.viewerCount + 1 WHERE p.id = :productId")
    void incrementViewerCount(@Param("productId") Long productId);
    
    // ===== END ALL LIVE STREAMS FOR SELLER =====
    @Modifying
    @Transactional
    @Query("UPDATE Product p SET p.isLive = false, p.liveEndTime = CURRENT_TIMESTAMP WHERE p.seller = :seller AND p.isLive = true")
    void endAllLiveStreamsForSeller(@Param("seller") SellerProfile seller);
    
    // ===== GET TOTAL LIVE VIEWERS =====
    @Query("SELECT COALESCE(SUM(p.viewerCount), 0) FROM Product p WHERE p.isLive = true")
    long getTotalLiveViewers();
    
    // ===== GET LIVE PRODUCTS WITH SELLER DETAILS =====
    @Query("SELECT p FROM Product p JOIN FETCH p.seller s WHERE p.isLive = true AND (p.liveEndTime IS NULL OR p.liveEndTime > CURRENT_TIMESTAMP)")
    List<Product> findCurrentlyLiveProductsWithSeller();
    
    // ===== CHECK IF PRODUCT IS LIVE =====
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Product p WHERE p.id = :productId AND p.isLive = true")
    boolean isProductLive(@Param("productId") Long productId);
    
    // ===== GET LIVE PRODUCTS BY CATEGORY =====
    @Query("SELECT p FROM Product p WHERE p.isLive = true AND p.category.id = :categoryId AND (p.liveEndTime IS NULL OR p.liveEndTime > CURRENT_TIMESTAMP)")
    List<Product> findLiveProductsByCategory(@Param("categoryId") Long categoryId);
    
    // ===== COUNT TOTAL LIVE PRODUCTS =====
    @Query("SELECT COUNT(p) FROM Product p WHERE p.isLive = true AND (p.liveEndTime IS NULL OR p.liveEndTime > CURRENT_TIMESTAMP)")
    long countCurrentlyLiveProducts();
}