package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.Wishlist;
import com.ecommerce.marketplace_api.service.WishlistService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/wishlist")
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            Wishlist wishlist = wishlistService.addToWishlist(userId, productId);
            return ResponseEntity.status(HttpStatus.CREATED).body(wishlist);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            List<Wishlist> wishlist = wishlistService.getUserWishlist(userId);
            return ResponseEntity.ok(wishlist);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            wishlistService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok("Removed from wishlist");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/check/{productId}")
    public ResponseEntity<?> isInWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            boolean isInWishlist = wishlistService.isInWishlist(userId, productId);
            return ResponseEntity.ok(isInWishlist);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}