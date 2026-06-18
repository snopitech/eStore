package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.SellerProfileRequest;
import com.ecommerce.marketplace_api.dto.SellerProfileResponse;
import com.ecommerce.marketplace_api.service.SellerProfileService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/seller")
public class SellerProfileController {
    
    private final SellerProfileService sellerProfileService;
    
    private final UserService userService;
    
    private final JwtUtil jwtUtil;

    SellerProfileController(SellerProfileService sellerProfileService, UserService userService, JwtUtil jwtUtil) {
        this.sellerProfileService = sellerProfileService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // For testing, return a default user ID (admin)
            return 1L;
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        return user.getId();
    }
    
    @PostMapping("/profile")
    public ResponseEntity<?> createSellerProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SellerProfileRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            SellerProfileResponse response = sellerProfileService.createSellerProfile(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<?> getMySellerProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            SellerProfileResponse response = sellerProfileService.getSellerProfileByUser(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateSellerProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SellerProfileRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            SellerProfileResponse response = sellerProfileService.updateSellerProfile(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/store/{storeSlug}")
    public ResponseEntity<?> getStoreBySlug(@PathVariable String storeSlug) {
        try {
            SellerProfileResponse response = sellerProfileService.getSellerProfileBySlug(storeSlug);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}