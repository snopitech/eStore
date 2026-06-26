package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.ReviewRequest;
import com.ecommerce.marketplace_api.dto.ReviewResponse;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.ReviewService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    
    private final ReviewService reviewService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    ReviewController(ReviewService reviewService, UserRepository userRepository, JwtUtil jwtUtil) {
        this.reviewService = reviewService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        try {
            List<ReviewResponse> reviews = reviewService.getProductReviews(productId);
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ReviewRequest request) {
        try {
            User user = getAuthenticatedUser(authHeader);
            
            // If no orderItemId provided, create a default one for testing
            if (request.getOrderItemId() == null) {
                // For testing, use a dummy order item
                request.setOrderItemId(1L);
            }
            
            ReviewResponse response = reviewService.createReview(user.getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== SELLER REVIEW MANAGEMENT =====
    
    @GetMapping("/seller/pending")
    public ResponseEntity<?> getPendingReviews(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = getAuthenticatedUser(authHeader);
            if (user.getUserType() != UserType.SELLER && user.getUserType() != UserType.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can access this");
            }
            List<ReviewResponse> reviews = reviewService.getPendingReviewsForSeller(user.getId());
            return ResponseEntity.ok(reviews);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{reviewId}/approve")
    public ResponseEntity<?> approveReview(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long reviewId) {
        try {
            User user = getAuthenticatedUser(authHeader);
            if (user.getUserType() != UserType.SELLER && user.getUserType() != UserType.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can approve reviews");
            }
            ReviewResponse response = reviewService.approveReview(reviewId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{reviewId}/reject")
    public ResponseEntity<?> rejectReview(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long reviewId) {
        try {
            User user = getAuthenticatedUser(authHeader);
            if (user.getUserType() != UserType.SELLER && user.getUserType() != UserType.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can reject reviews");
            }
            ReviewResponse response = reviewService.rejectReview(reviewId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}