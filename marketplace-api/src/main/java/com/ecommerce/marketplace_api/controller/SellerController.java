package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.PayoutSettingsRequest;
import com.ecommerce.marketplace_api.dto.PayoutSettingsResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.*;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public SellerController(SellerProfileRepository sellerProfileRepository,
                            UserRepository userRepository,
                            JwtUtil jwtUtil,
                            ProductRepository productRepository,
                            ReviewRepository reviewRepository) {
        this.sellerProfileRepository = sellerProfileRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }

    // ===== HELPER METHOD =====
    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ===== GET PAYOUT SETTINGS =====
    @GetMapping("/payout-settings")
    public ResponseEntity<?> getPayoutSettings(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = getAuthenticatedUser(authHeader);
            
            if (user.getUserType() != UserType.SELLER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can access this");
            }

            SellerProfile sellerProfile = sellerProfileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Seller profile not found"));

            PayoutSettingsResponse response = new PayoutSettingsResponse(
                sellerProfile.getPayoutMethod(),
                sellerProfile.getPayoutAccountName(),
                sellerProfile.getPayoutAccountNumber(),
                sellerProfile.getPayoutRoutingNumber(),
                sellerProfile.getPayoutPaypalEmail(),
                sellerProfile.getPayoutEmail()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== UPDATE PAYOUT SETTINGS =====
    @PutMapping("/payout-settings")
    public ResponseEntity<?> updatePayoutSettings(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                                   @RequestBody PayoutSettingsRequest request) {
        try {
            User user = getAuthenticatedUser(authHeader);
            
            if (user.getUserType() != UserType.SELLER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can access this");
            }

            SellerProfile sellerProfile = sellerProfileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Seller profile not found"));

            sellerProfile.setPayoutMethod(request.getPayoutMethod() != null ? request.getPayoutMethod() : "BANK");
            sellerProfile.setPayoutAccountName(request.getPayoutAccountName());
            sellerProfile.setPayoutAccountNumber(request.getPayoutAccountNumber());
            sellerProfile.setPayoutRoutingNumber(request.getPayoutRoutingNumber());
            sellerProfile.setPayoutPaypalEmail(request.getPayoutPaypalEmail());
            sellerProfile.setPayoutEmail(request.getPayoutEmail());

            sellerProfileRepository.save(sellerProfile);

            PayoutSettingsResponse response = new PayoutSettingsResponse(
                sellerProfile.getPayoutMethod(),
                sellerProfile.getPayoutAccountName(),
                sellerProfile.getPayoutAccountNumber(),
                sellerProfile.getPayoutRoutingNumber(),
                sellerProfile.getPayoutPaypalEmail(),
                sellerProfile.getPayoutEmail()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== GET SELLER PROFILE (Authenticated) =====
    @GetMapping("/profile")
    public ResponseEntity<?> getSellerProfile(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            User user = getAuthenticatedUser(authHeader);
            
            if (user.getUserType() != UserType.SELLER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can access this");
            }

            SellerProfile seller = sellerProfileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Seller profile not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", seller.getId());
            response.put("storeName", seller.getStoreName());
            response.put("storeSlug", seller.getStoreSlug());
            response.put("storeDescription", seller.getStoreDescription());
            response.put("isActive", seller.getIsActive());
            response.put("isApproved", seller.getIsApproved());
            response.put("totalProducts", seller.getTotalProducts());
            response.put("totalSales", seller.getTotalSales());
            response.put("rating", seller.getRating());
            response.put("totalReviews", seller.getTotalReviews());
            response.put("averageRating", seller.getAverageRating());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== STOREFRONT ENDPOINTS (Public) =====
    
    // Get seller by store slug
    @GetMapping("/store/{storeSlug}")
    public ResponseEntity<?> getSellerByStoreSlug(@PathVariable String storeSlug) {
        try {
            SellerProfile seller = sellerProfileRepository.findByStoreSlug(storeSlug)
                    .orElseThrow(() -> new RuntimeException("Store not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", seller.getId());
            response.put("storeName", seller.getStoreName());
            response.put("storeSlug", seller.getStoreSlug());
            response.put("storeDescription", seller.getStoreDescription());
            response.put("storeLogoUrl", seller.getStoreLogoUrl());
            response.put("storeBannerUrl", seller.getStoreBannerUrl());
            response.put("rating", seller.getRating());
            response.put("totalSales", seller.getTotalSales());
            response.put("totalProducts", seller.getTotalProducts());
            response.put("totalReviews", seller.getTotalReviews());
            response.put("positiveReviews", seller.getPositiveReviews());
            response.put("averageRating", seller.getAverageRating());
            response.put("createdAt", seller.getCreatedAt());
            response.put("isActive", seller.getIsActive());
            response.put("isApproved", seller.getIsApproved());

            User user = seller.getUser();
            if (user != null) {
                response.put("userId", user.getId());
                response.put("userEmail", user.getEmail());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
            }

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get seller products by store slug
    @GetMapping("/store/{storeSlug}/products")
    public ResponseEntity<?> getSellerProductsByStoreSlug(@PathVariable String storeSlug) {
        try {
            SellerProfile seller = sellerProfileRepository.findByStoreSlug(storeSlug)
                    .orElseThrow(() -> new RuntimeException("Store not found"));

            List<Product> products = productRepository.findBySellerAndStatus(seller, ProductStatus.ACTIVE);
            
            List<Map<String, Object>> productResponses = products.stream().map(product -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", product.getId());
                map.put("name", product.getName());
                map.put("slug", product.getSlug());
                map.put("price", product.getPrice());
                map.put("quantity", product.getQuantity());
                map.put("images", product.getImages());
                map.put("rating", product.getRating());
                map.put("salesCount", product.getSalesCount());
                map.put("status", product.getStatus().name());
                map.put("createdAt", product.getCreatedAt());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(productResponses);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get seller reviews by store slug
    @GetMapping("/store/{storeSlug}/reviews")
    public ResponseEntity<?> getSellerReviewsByStoreSlug(@PathVariable String storeSlug) {
        try {
            SellerProfile seller = sellerProfileRepository.findByStoreSlug(storeSlug)
                    .orElseThrow(() -> new RuntimeException("Store not found"));

            List<Review> allReviews = reviewRepository.findAllReviewsBySeller(seller);
            List<Review> approvedReviews = allReviews.stream()
                    .filter(r -> r.getStatus() == ReviewStatus.APPROVED)
                    .collect(Collectors.toList());

            List<Map<String, Object>> reviewResponses = approvedReviews.stream().map(review -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", review.getId());
                map.put("rating", review.getRating());
                map.put("title", review.getTitle());
                map.put("comment", review.getComment());
                map.put("reviewerName", review.getReviewer() != null ? 
                    review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName() : "Anonymous");
                map.put("verifiedPurchase", review.getIsVerifiedPurchase());
                map.put("productName", review.getProduct() != null ? review.getProduct().getName() : null);
                map.put("createdAt", review.getCreatedAt());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(reviewResponses);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Check if seller exists
    @GetMapping("/store/{storeSlug}/exists")
    public ResponseEntity<?> checkSellerExists(@PathVariable String storeSlug) {
        try {
            boolean exists = sellerProfileRepository.findByStoreSlug(storeSlug).isPresent();
            Map<String, Object> response = new HashMap<>();
            response.put("exists", exists);
            response.put("storeSlug", storeSlug);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}