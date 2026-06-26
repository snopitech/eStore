package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.Wishlist;
import com.ecommerce.marketplace_api.service.WishlistService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class WishlistController {
    
    private final WishlistService wishlistService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    WishlistController(WishlistService wishlistService, UserService userService, JwtUtil jwtUtil) {
        this.wishlistService = wishlistService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userService.getUserByEmail(email);
            return user.getId();
        } catch (Exception e) {
            return null;
        }
    }
    
    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Please login");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        try {
            Wishlist wishlist = wishlistService.addToWishlist(userId, productId);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Added to wishlist");
            response.put("wishlist", wishlist);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Please login");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        try {
            List<Wishlist> wishlist = wishlistService.getUserWishlist(userId);
            return ResponseEntity.ok(wishlist);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Please login");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        try {
            wishlistService.removeFromWishlist(userId, productId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Removed from wishlist");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/check/{productId}")
    public ResponseEntity<?> isInWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            Map<String, Boolean> response = new HashMap<>();
            response.put("inWishlist", false);
            return ResponseEntity.ok(response);
        }
        try {
            boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("inWishlist", isInWishlist);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Boolean> response = new HashMap<>();
            response.put("inWishlist", false);
            return ResponseEntity.ok(response);
        }
    }
}