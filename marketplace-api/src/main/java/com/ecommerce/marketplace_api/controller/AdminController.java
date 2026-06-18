package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.*;
import com.ecommerce.marketplace_api.service.UserService;
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
@RequestMapping("/api/admin")
public class AdminController {
    
    private final UserRepository userRepository;
    
    private final ProductRepository productRepository;
    
    private final CategoryRepository categoryRepository;
    
    private final OrderRepository orderRepository;
    
    private final SellerProfileRepository sellerProfileRepository;
    
    private final UserService userService;
    
    private final JwtUtil jwtUtil;

    AdminController(UserRepository userRepository, ProductRepository productRepository, CategoryRepository categoryRepository, OrderRepository orderRepository, SellerProfileRepository sellerProfileRepository, UserService userService, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    
    private boolean isAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        try {
            String token = authHeader.substring(7);
            String email = jwtUtil.extractEmail(token);
            User user = userService.getUserByEmail(email);
            return user != null && user.getUserType() == UserType.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }
    
    // ===== DASHBOARD STATS =====
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userRepository.count());
            stats.put("totalBuyers", userRepository.countByUserType(UserType.BUYER));
            stats.put("totalSellers", userRepository.countByUserType(UserType.SELLER));
            stats.put("totalProducts", productRepository.count());
            stats.put("activeProducts", productRepository.countByStatus(ProductStatus.ACTIVE));
            stats.put("totalCategories", categoryRepository.count());
            stats.put("totalOrders", orderRepository.count());
            stats.put("pendingOrders", orderRepository.countByStatus(OrderStatus.PENDING));
            stats.put("totalRevenue", orderRepository.findAll().stream()
                    .mapToDouble(o -> o.getTotalAmount().doubleValue())
                    .sum());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ===== USER MANAGEMENT =====
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long userId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
 @PutMapping("/users/{userId}/role")
public ResponseEntity<?> updateUserRole(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable Long userId,
        @RequestBody Map<String, String> request) {
    if (!isAdmin(authHeader)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
    }
    try {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String newRole = request.get("role");
        user.setUserType(UserType.valueOf(newRole));
        userRepository.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User role updated to " + newRole);
        response.put("userId", userId.toString());
        response.put("newRole", newRole);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
    
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long userId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            userRepository.deleteById(userId);
            return ResponseEntity.ok("User deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ===== SELLER MANAGEMENT =====
    @GetMapping("/sellers")
    public ResponseEntity<?> getAllSellers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            List<SellerProfile> sellers = sellerProfileRepository.findAll();
            return ResponseEntity.ok(sellers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
@PutMapping("/sellers/{sellerId}/approve")
public ResponseEntity<?> approveSeller(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable Long sellerId) {
    System.out.println("=== APPROVE SELLER ===");
    System.out.println("Seller ID: " + sellerId);
    System.out.println("Auth Header: " + authHeader);
    
    if (!isAdmin(authHeader)) {
        System.out.println("Not admin, returning 403");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
    }
    try {
        System.out.println("Looking for seller with id: " + sellerId);
        SellerProfile seller = sellerProfileRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found with id: " + sellerId));
        
        System.out.println("Found seller: " + seller.getId() + ", store: " + seller.getStoreName());
        System.out.println("Current isApproved: " + seller.getIsApproved());
        
        seller.setIsApproved(true);
        seller.setIsActive(true);
        SellerProfile saved = sellerProfileRepository.save(seller);
        
        System.out.println("Saved seller, isApproved: " + saved.getIsApproved());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Seller approved successfully");
        response.put("sellerId", sellerId.toString());
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        System.out.println("ERROR: " + e.getMessage());
        e.printStackTrace();
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
    
  @PutMapping("/sellers/{sellerId}/block")
public ResponseEntity<?> blockSeller(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        @PathVariable Long sellerId) {
    if (!isAdmin(authHeader)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
    }
    try {
        SellerProfile seller = sellerProfileRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        seller.setIsActive(false);
        sellerProfileRepository.save(seller);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Seller blocked successfully");
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
    
    // ===== PRODUCT MANAGEMENT =====
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            List<Product> products = productRepository.findAll();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            productRepository.deleteById(productId);
            return ResponseEntity.ok("Product deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ===== ORDER MANAGEMENT =====
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            List<Order> orders = orderRepository.findAll();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            String newStatus = request.get("status");
            order.setStatus(OrderStatus.valueOf(newStatus));
            orderRepository.save(order);
            
            return ResponseEntity.ok("Order status updated to " + newStatus);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // ===== CATEGORY MANAGEMENT =====
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Category category) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            Category saved = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody Category category) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            Category existing = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            existing.setName(category.getName());
            existing.setSlug(category.getSlug());
            existing.setDescription(category.getDescription());
            existing.setDisplayOrder(category.getDisplayOrder());
            existing.setIsActive(category.getIsActive());
            return ResponseEntity.ok(categoryRepository.save(existing));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            categoryRepository.deleteById(id);
            return ResponseEntity.ok("Category deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}