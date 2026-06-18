package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.ReviewRequest;
import com.ecommerce.marketplace_api.dto.ReviewResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ecommerce.marketplace_api.model.ReviewStatus;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    
    private final ProductRepository productRepository;
    
    private final UserRepository userRepository;
    
    private final OrderItemRepository orderItemRepository;

    ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository, UserRepository userRepository, OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
    }
    
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("Order item not found"));
        
        // Check if user already reviewed this product from this order
        if (reviewRepository.existsByOrderItemId(request.getOrderItemId())) {
            throw new RuntimeException("You have already reviewed this product from this order");
        }
        
        Review review = new Review();
        review.setProduct(product);
        review.setReviewer(reviewer);
        review.setOrderItem(orderItem);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setImages(request.getImages());
        review.setStatus(ReviewStatus.APPROVED);
        
        Review saved = reviewRepository.save(review);
        
        // Update product rating
        updateProductRating(product);
        
        return convertToResponse(saved);
    }
    
    public List<ReviewResponse> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return reviewRepository.findByProductAndStatus(product, ReviewStatus.APPROVED).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<ReviewResponse> getUserReviews(Long userId) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return reviewRepository.findAll().stream()
                .filter(r -> r.getReviewer().getId().equals(userId))
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ReviewResponse updateReview(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getReviewer().getId().equals(userId)) {
            throw new RuntimeException("You don't own this review");
        }
        
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setImages(request.getImages());
        
        Review saved = reviewRepository.save(review);
        
        // Update product rating
        updateProductRating(review.getProduct());
        
        return convertToResponse(saved);
    }
    
    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getReviewer().getId().equals(userId)) {
            throw new RuntimeException("You don't own this review");
        }
        
        Product product = review.getProduct();
        reviewRepository.delete(review);
        
        // Update product rating
        updateProductRating(product);
    }
    
    private void updateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProduct(product);
        if (reviews.isEmpty()) {
            product.setRating(BigDecimal.ZERO);
            product.setReviewsCount(0);
        } else {
            double avg = reviews.stream()
                    .filter(r -> r.getStatus() == ReviewStatus.APPROVED)
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            product.setRating(BigDecimal.valueOf(avg));
            product.setReviewsCount((int) reviews.stream()
                    .filter(r -> r.getStatus() == ReviewStatus.APPROVED)
                    .count());
        }
        productRepository.save(product);
    }
    
    private ReviewResponse convertToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProduct().getId());
        response.setProductName(review.getProduct().getName());
        response.setReviewerId(review.getReviewer().getId());
        response.setReviewerName(review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName());
        response.setRating(review.getRating());
        response.setTitle(review.getTitle());
        response.setComment(review.getComment());
        response.setImages(review.getImages());
        response.setVerifiedPurchase(review.getIsVerifiedPurchase());
        response.setStatus(review.getStatus().name());
        response.setHelpfulCount(review.getHelpfulCount());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}