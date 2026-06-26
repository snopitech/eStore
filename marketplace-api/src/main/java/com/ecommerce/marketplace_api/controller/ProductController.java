package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api")
public class ProductController {
    
    private final ProductService productService;

    ProductController(ProductService productService) {
        this.productService = productService;
    }
    
    // ===== PUBLIC ENDPOINTS - Anyone can view =====
    
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            ProductResponse product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }
    
    // ===== NEW: LIVE STREAMING ENDPOINTS =====
    
    // Get all currently live products
    @GetMapping("/products/live")
    public ResponseEntity<?> getLiveProducts() {
        try {
            List<ProductResponse> liveProducts = productService.getLiveProducts();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalViewers", productService.getTotalLiveViewers());
            response.put("products", liveProducts);
            response.put("count", liveProducts.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Increment viewer count for a product (called when someone watches)
    @PostMapping("/products/{productId}/view")
    public ResponseEntity<?> incrementViewCount(@PathVariable Long productId) {
        try {
            productService.incrementViewerCount(productId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "View count updated");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}