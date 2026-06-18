package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.CartItemRequest;
import com.ecommerce.marketplace_api.dto.CartItemResponse;
import com.ecommerce.marketplace_api.service.CartService;
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
@RequestMapping("/api/cart")
public class CartController {
    
    private final CartService cartService;
    
    private final UserService userService;
    
    private final JwtUtil jwtUtil;

    CartController(CartService cartService, UserService userService, JwtUtil jwtUtil) {
        this.cartService = cartService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return 1L; // Default for testing
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        return user.getId();
    }
    
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        return ResponseEntity.ok(cartService.getCart(userId));
    }
    
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CartItemRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            CartItemResponse response = cartService.addToCart(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/update/{itemId}")
    public ResponseEntity<?> updateCartItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            CartItemResponse response = cartService.updateCartItemQuantity(userId, itemId, quantity);
            if (response == null) {
                return ResponseEntity.ok("Item removed from cart");
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<?> removeFromCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long itemId) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            cartService.removeFromCart(userId, itemId);
            return ResponseEntity.ok("Item removed from cart");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            cartService.clearCart(userId);
            return ResponseEntity.ok("Cart cleared successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}