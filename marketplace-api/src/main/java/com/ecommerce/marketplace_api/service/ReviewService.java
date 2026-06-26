package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.ReviewRequest;
import com.ecommerce.marketplace_api.dto.ReviewResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private final SellerProfileRepository sellerProfileRepository;
    private final OrderRepository orderRepository;

    ReviewService(ReviewRepository reviewRepository, 
                  ProductRepository productRepository, 
                  UserRepository userRepository, 
                  OrderItemRepository orderItemRepository,
                  SellerProfileRepository sellerProfileRepository,
                  OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderItemRepository = orderItemRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.orderRepository = orderRepository;
    }
    
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User reviewer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        boolean isVerifiedPurchase = isVerifiedBuyer(userId, product);
        
        OrderItem orderItem = getOrCreateOrderItem(product, request.getOrderItemId());
        
        SellerProfile seller = product.getSeller();
        if (seller == null) {
            throw new RuntimeException("Product has no seller");
        }
        
        Review review = new Review();
        review.setProduct(product);
        review.setSellerId(seller.getId());
        review.setReviewer(reviewer);
        review.setOrderItem(orderItem);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setImages(request.getImages());
        review.setIsVerifiedPurchase(isVerifiedPurchase);
        review.setStatus(ReviewStatus.PENDING);
        review.setCreatedAt(LocalDateTime.now());
        
        Review saved = reviewRepository.save(review);
        
        return convertToResponse(saved);
    }
    
    private boolean isVerifiedBuyer(Long userId, Product product) {
        List<OrderItem> orderItems = orderItemRepository.findByProduct(product);
        for (OrderItem item : orderItems) {
            Order order = item.getOrder();
            if (order != null && order.getBuyer() != null) {
                if (order.getBuyer().getId().equals(userId)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    private OrderItem getOrCreateOrderItem(Product product, Long orderItemId) {
        if (orderItemId != null && orderItemId > 0) {
            try {
                return orderItemRepository.findById(orderItemId).orElse(null);
            } catch (Exception e) {
                // Fall through
            }
        }
        
        OrderItem newOrderItem = new OrderItem();
        newOrderItem.setOrderId(1L);
        newOrderItem.setProductId(product.getId());
        newOrderItem.setProductName(product.getName());
        newOrderItem.setQuantity(1);
        newOrderItem.setUnitPrice(product.getPrice());
        newOrderItem.setTotalPrice(product.getPrice());
        newOrderItem.setStatus(OrderItemStatus.CONFIRMED);
        newOrderItem.setCreatedAt(LocalDateTime.now());
        newOrderItem.setUpdatedAt(LocalDateTime.now());
        return orderItemRepository.save(newOrderItem);
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
        
        return reviewRepository.findByReviewer(reviewer).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<ReviewResponse> getPendingReviewsForSeller(Long userId) {
        User seller = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        
        SellerProfile sellerProfile = sellerProfileRepository.findByUser(seller)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        List<Review> pendingReviews = reviewRepository.findReviewsBySellerAndStatus(sellerProfile, ReviewStatus.PENDING);
        
        return pendingReviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setStatus(ReviewStatus.APPROVED);
        Review saved = reviewRepository.save(review);
        
        updateProductRating(review.getProduct());
        updateSellerRating(review.getProduct().getSeller());
        
        return convertToResponse(saved);
    }
    
    @Transactional
    public ReviewResponse rejectReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        review.setStatus(ReviewStatus.REJECTED);
        Review saved = reviewRepository.save(review);
        
        return convertToResponse(saved);
    }
    
    private void updateProductRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductAndStatus(product, ReviewStatus.APPROVED);
        
        if (reviews.isEmpty()) {
            product.setRating(BigDecimal.ZERO);
            product.setReviewsCount(0);
        } else {
            double avg = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            product.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            product.setReviewsCount(reviews.size());
        }
        productRepository.save(product);
    }
    
    private void updateSellerRating(SellerProfile seller) {
        if (seller == null) return;
        
        List<Review> reviews = reviewRepository.findApprovedReviewsBySeller(seller);
        
        if (reviews.isEmpty()) {
            seller.setAverageRating(BigDecimal.ZERO);
            seller.setTotalReviews(0);
            seller.setPositiveReviews(0);
        } else {
            int total = reviews.size();
            long positive = reviews.stream()
                    .filter(r -> r.getRating() >= 4)
                    .count();
            
            double avg = reviews.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            
            seller.setAverageRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            seller.setTotalReviews(total);
            seller.setPositiveReviews((int) positive);
        }
        sellerProfileRepository.save(seller);
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