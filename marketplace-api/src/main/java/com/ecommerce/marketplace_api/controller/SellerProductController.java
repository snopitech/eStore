package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.ProductRequest;
import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.model.SellerProfile;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import com.ecommerce.marketplace_api.service.ProductService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/seller")
public class SellerProductController {
    
    private final ProductService productService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final SellerProfileRepository sellerProfileRepository;

    SellerProductController(ProductService productService, 
                            UserService userService, 
                            JwtUtil jwtUtil,
                            SellerProfileRepository sellerProfileRepository) {
        this.productService = productService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.sellerProfileRepository = sellerProfileRepository;
    }
    
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        return user != null ? user.getId() : null;
    }
    
    private SellerProfile validateSeller(String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            throw new RuntimeException("Please login");
        }
        
        User user = userService.getUserByEmail(jwtUtil.extractEmail(authHeader.substring(7)));
        if (user.getUserType() != UserType.SELLER) {
            throw new RuntimeException("Only sellers can perform this action");
        }
        
        SellerProfile seller = sellerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        // CHECK 1: Is seller approved?
        if (!seller.getIsApproved()) {
            throw new RuntimeException("Your seller account is not approved. Please wait for admin approval.");
        }
        
        // CHECK 2: Is seller active?
        if (!seller.getIsActive()) {
            throw new RuntimeException("Your seller account has been disabled. Please contact admin for assistance.");
        }
        
        return seller;
    }
    
    @GetMapping("/products")
    public ResponseEntity<?> getSellerProducts(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Please login");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        try {
            List<ProductResponse> products = productService.getSellerProducts(userId);
            
            // Get seller status for warning
            User user = userService.getUserByEmail(jwtUtil.extractEmail(authHeader.substring(7)));
            SellerProfile seller = sellerProfileRepository.findByUser(user).orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("products", products);
            
            if (seller != null) {
                if (!seller.getIsActive()) {
                    response.put("warning", "⚠️ Your seller account is DISABLED. You can view your products but CANNOT create new ones.");
                }
                if (!seller.getIsApproved()) {
                    response.put("warning", "⏳ Your seller account is NOT APPROVED. Please wait for admin approval.");
                }
                response.put("isActive", seller.getIsActive());
                response.put("isApproved", seller.getIsApproved());
            }
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody ProductRequest request) {
        try {
            // This validates seller is active AND approved
            SellerProfile seller = validateSeller(authHeader);
            Long userId = getUserIdFromToken(authHeader);
            
            ProductResponse response = productService.createProduct(userId, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Product created successfully");
            result.put("product", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        try {
            // This validates seller is active AND approved
            SellerProfile seller = validateSeller(authHeader);
            Long userId = getUserIdFromToken(authHeader);
            
            ProductResponse response = productService.updateProduct(userId, id, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Product updated successfully");
            result.put("product", response);
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            // This validates seller is active AND approved
            SellerProfile seller = validateSeller(authHeader);
            Long userId = getUserIdFromToken(authHeader);
            
            productService.deleteProduct(userId, id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Product deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ===== NEW: LIVE STREAMING ENDPOINTS =====
    
    // Start a live stream for a product
    @PostMapping("/products/{productId}/go-live")
    public ResponseEntity<?> startLiveStream(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId,
            @RequestBody(required = false) Map<String, Object> request) {
        try {
            SellerProfile seller = validateSeller(authHeader);
            Long userId = getUserIdFromToken(authHeader);
            
            BigDecimal livePrice = null;
            if (request != null && request.containsKey("livePrice")) {
                livePrice = new BigDecimal(request.get("livePrice").toString());
            }
            
            ProductResponse response = productService.startLiveStream(userId, productId, livePrice);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "🚀 Live stream started successfully!");
            result.put("product", response);
            result.put("liveUrl", "/live/" + productId);
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // End a live stream
    @PutMapping("/products/{productId}/end-live")
    public ResponseEntity<?> endLiveStream(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {
        try {
            SellerProfile seller = validateSeller(authHeader);
            Long userId = getUserIdFromToken(authHeader);
            
            ProductResponse response = productService.endLiveStream(userId, productId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "📺 Live stream ended successfully");
            result.put("product", response);
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Get seller's live products
    @GetMapping("/live/products")
    public ResponseEntity<?> getSellerLiveProducts(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
            }
            
            List<ProductResponse> liveProducts = productService.getSellerLiveProducts(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasLiveStream", !liveProducts.isEmpty());
            response.put("products", liveProducts);
            response.put("count", liveProducts.size());
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Check if seller has an active live stream
    @GetMapping("/live/status")
    public ResponseEntity<?> getLiveStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
            }
            
            boolean hasLiveStream = productService.hasLiveStream(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("isLive", hasLiveStream);
            
            if (hasLiveStream) {
                List<ProductResponse> liveProducts = productService.getSellerLiveProducts(userId);
                response.put("liveProduct", liveProducts.isEmpty() ? null : liveProducts.get(0));
                response.put("viewers", liveProducts.isEmpty() ? 0 : liveProducts.get(0).getViewerCount());
            }
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}