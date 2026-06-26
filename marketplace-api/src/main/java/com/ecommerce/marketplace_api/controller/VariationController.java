package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.VariationRequest;
import com.ecommerce.marketplace_api.dto.VariationResponse;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.VariationService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class VariationController {

    private final VariationService variationService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public VariationController(VariationService variationService,
                               UserRepository userRepository,
                               JwtUtil jwtUtil) {
        this.variationService = variationService;
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

    /**
     * Create a variation for a product (Seller/Admin only)
     * POST /api/products/{productId}/variations
     */
    @PostMapping("/{productId}/variations")
    public ResponseEntity<?> createVariation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId,
            @RequestBody VariationRequest request) {
        try {
            User user = getAuthenticatedUser(authHeader);
            if (user.getUserType() != UserType.SELLER && user.getUserType() != UserType.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can create variations");
            }

            VariationResponse response = variationService.createVariation(productId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all variations for a product (Public)
     * GET /api/products/{productId}/variations
     */
    @GetMapping("/{productId}/variations")
    public ResponseEntity<?> getVariations(
            @PathVariable Long productId,
            @RequestParam(required = false) Boolean activeOnly) {
        try {
            List<VariationResponse> variations;
            if (activeOnly != null && activeOnly) {
                variations = variationService.getActiveVariationsByProduct(productId);
            } else {
                variations = variationService.getVariationsByProduct(productId);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("variations", variations);
            response.put("count", variations.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get variations by type (Public)
     * GET /api/products/{productId}/variations/type/{type}
     */
    @GetMapping("/{productId}/variations/type/{type}")
    public ResponseEntity<?> getVariationsByType(
            @PathVariable Long productId,
            @PathVariable String type) {
        try {
            List<VariationResponse> variations = variationService.getVariationsByType(productId, type);

            Map<String, Object> response = new HashMap<>();
            response.put("type", type);
            response.put("variations", variations);
            response.put("count", variations.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Update a variation (Seller/Admin only)
     * PUT /api/products/variations/{variationId}
     */
    @PutMapping("/variations/{variationId}")
    public ResponseEntity<?> updateVariation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long variationId,
            @RequestBody VariationRequest request) {
        try {
            User user = getAuthenticatedUser(authHeader);
            if (user.getUserType() != UserType.SELLER && user.getUserType() != UserType.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can update variations");
            }

            VariationResponse response = variationService.updateVariation(variationId, request);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Delete a variation (Seller/Admin only)
     * DELETE /api/products/variations/{variationId}
     */
    @DeleteMapping("/variations/{variationId}")
    public ResponseEntity<?> deleteVariation(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long variationId) {
        try {
            User user = getAuthenticatedUser(authHeader);
            if (user.getUserType() != UserType.SELLER && user.getUserType() != UserType.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can delete variations");
            }

            variationService.deleteVariation(variationId);
            return ResponseEntity.ok("Variation deleted successfully");

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Check if a variation is in stock (Public)
     * GET /api/products/variations/{variationId}/stock
     */
    @GetMapping("/variations/{variationId}/stock")
    public ResponseEntity<?> checkStock(@PathVariable Long variationId) {
        try {
            boolean inStock = variationService.isVariationInStock(variationId);

            Map<String, Object> response = new HashMap<>();
            response.put("inStock", inStock);
            response.put("variationId", variationId);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}