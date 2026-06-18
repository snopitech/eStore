package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.ProductRequest;
import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.service.ProductService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    SellerProductController(ProductService productService, UserService userService, JwtUtil jwtUtil) {
        this.productService = productService;
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
        return ResponseEntity.ok(products);
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
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            ProductResponse response = productService.createProduct(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            ProductResponse response = productService.updateProduct(userId, id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        Long userId = getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Please login");
        }
        try {
            productService.deleteProduct(userId, id);
            return ResponseEntity.ok("Product deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}