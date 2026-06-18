package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.Review;
import com.ecommerce.marketplace_api.model.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductAndStatus(Product product, ReviewStatus status);
    List<Review> findByProduct(Product product);
    boolean existsByOrderItemId(Long orderItemId);
}