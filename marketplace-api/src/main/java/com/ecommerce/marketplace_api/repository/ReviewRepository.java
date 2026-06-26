package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.Review;
import com.ecommerce.marketplace_api.model.ReviewStatus;
import com.ecommerce.marketplace_api.model.SellerProfile;
import com.ecommerce.marketplace_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // ===== BASIC QUERIES =====
    List<Review> findByProduct(Product product);
    List<Review> findByReviewer(User reviewer);
    List<Review> findByProductAndStatus(Product product, ReviewStatus status);
    List<Review> findByStatus(ReviewStatus status);

    // ===== SELLER REVIEWS =====
    @Query("SELECT r FROM Review r WHERE r.product.seller = :seller AND r.status = :status")
    List<Review> findReviewsBySellerAndStatus(@Param("seller") SellerProfile seller, @Param("status") ReviewStatus status);

    @Query("SELECT r FROM Review r WHERE r.product.seller = :seller AND r.status = 'APPROVED'")
    List<Review> findApprovedReviewsBySeller(@Param("seller") SellerProfile seller);

    @Query("SELECT r FROM Review r WHERE r.product.seller = :seller")
    List<Review> findAllReviewsBySeller(@Param("seller") SellerProfile seller);

    // ===== ORDER ITEM =====
    boolean existsByOrderItemId(Long orderItemId);
}