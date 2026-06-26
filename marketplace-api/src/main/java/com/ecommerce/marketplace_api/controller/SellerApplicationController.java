package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.SellerApplicationRequest;
import com.ecommerce.marketplace_api.dto.SellerApplicationResponse;
import com.ecommerce.marketplace_api.service.SellerApplicationService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/seller")
public class SellerApplicationController {
    
    private final SellerApplicationService sellerApplicationService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    SellerApplicationController(SellerApplicationService sellerApplicationService, UserService userService, JwtUtil jwtUtil) {
        this.sellerApplicationService = sellerApplicationService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        return user.getId();
    }
    
    @PostMapping("/apply")
    public ResponseEntity<?> applyForSeller(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SellerApplicationRequest request) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            SellerApplicationResponse response = sellerApplicationService.applyForSeller(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/my-application")
    public ResponseEntity<?> getMyApplication(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            SellerApplicationResponse response = sellerApplicationService.getApplicationByUser(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}