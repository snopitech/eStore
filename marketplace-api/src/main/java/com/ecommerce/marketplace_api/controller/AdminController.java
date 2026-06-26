package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.SellerApplicationResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.*;
import com.ecommerce.marketplace_api.service.EmailService;
import com.ecommerce.marketplace_api.service.SellerApplicationService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private final SellerApplicationService sellerApplicationService;
    private final EmailService emailService;

    AdminController(UserRepository userRepository, 
                    ProductRepository productRepository, 
                    CategoryRepository categoryRepository, 
                    OrderRepository orderRepository, 
                    SellerProfileRepository sellerProfileRepository, 
                    UserService userService, 
                    JwtUtil jwtUtil, 
                    SellerApplicationService sellerApplicationService,
                    EmailService emailService) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderRepository = orderRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.sellerApplicationService = sellerApplicationService;
        this.emailService = emailService;
    }
    
    private boolean isAdmin(String authHeader) {
        System.out.println("=== CHECKING ADMIN ===");
        System.out.println("Auth Header: " + authHeader);
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No auth header or invalid format");
            return false;
        }
        try {
            String token = authHeader.substring(7);
            System.out.println("Token: " + token.substring(0, Math.min(50, token.length())) + "...");
            
            String email = jwtUtil.extractEmail(token);
            System.out.println("Extracted email: " + email);
            
            User user = userService.getUserByEmail(email);
            System.out.println("Found user: " + user.getEmail() + ", type: " + user.getUserType());
            
            boolean isAdmin = user != null && user.getUserType() == UserType.ADMIN;
            System.out.println("Is admin: " + isAdmin);
            return isAdmin;
        } catch (Exception e) {
            System.out.println("Error in isAdmin: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
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
            // Check if user is a seller - if so, also deactivate seller profile
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (user.getUserType() == UserType.SELLER) {
                sellerProfileRepository.findByUser(user).ifPresent(seller -> {
                    seller.setIsActive(false);
                    seller.setIsApproved(false);
                    sellerProfileRepository.save(seller);
                });
            }
            
            userRepository.deleteById(userId);
            return ResponseEntity.ok("User deleted successfully");
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
            
            List<Map<String, Object>> sellerDetails = new ArrayList<>();
            
            for (SellerProfile seller : sellers) {
                Map<String, Object> map = new LinkedHashMap<>();
                
                // Seller profile fields
                map.put("id", seller.getId());
                map.put("sellerId", seller.getId());
                map.put("storeName", seller.getStoreName());
                map.put("storeSlug", seller.getStoreSlug());
                map.put("storeDescription", seller.getStoreDescription());
                map.put("isApproved", seller.getIsApproved());
                map.put("isActive", seller.getIsActive());
                map.put("rating", seller.getRating() != null ? seller.getRating() : 0);
                map.put("totalSales", seller.getTotalSales() != null ? seller.getTotalSales() : 0);
                map.put("totalProducts", seller.getTotalProducts() != null ? seller.getTotalProducts() : 0);
                map.put("createdAt", seller.getCreatedAt());
                
                // User fields (including email)
                User user = seller.getUser();
                if (user != null) {
                    map.put("userId", user.getId());
                    map.put("email", user.getEmail());
                    map.put("firstName", user.getFirstName());
                    map.put("lastName", user.getLastName());
                    map.put("fullName", user.getFirstName() + " " + user.getLastName());
                    map.put("phoneNumber", user.getPhoneNumber());
                    map.put("userType", user.getUserType().name());
                }
                
                sellerDetails.add(map);
            }
            
            return ResponseEntity.ok(sellerDetails);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/sellers/{sellerId}")
    public ResponseEntity<?> getSellerById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long sellerId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            SellerProfile seller = sellerProfileRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", seller.getId());
            response.put("storeName", seller.getStoreName());
            response.put("storeSlug", seller.getStoreSlug());
            response.put("storeDescription", seller.getStoreDescription());
            response.put("isApproved", seller.getIsApproved());
            response.put("isActive", seller.getIsActive());
            response.put("rating", seller.getRating());
            response.put("totalSales", seller.getTotalSales());
            response.put("totalProducts", seller.getTotalProducts());
            response.put("createdAt", seller.getCreatedAt());
            
            User user = seller.getUser();
            if (user != null) {
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("firstName", user.getFirstName());
                response.put("lastName", user.getLastName());
                response.put("phoneNumber", user.getPhoneNumber());
            }
            
            return ResponseEntity.ok(response);
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
            
            // Send approval email
            User user = seller.getUser();
            try {
                emailService.sendSellerApprovalEmail(
                    user.getEmail(),
                    user.getFirstName() + " " + user.getLastName(),
                    seller.getStoreName()
                );
                System.out.println("✅ Approval email sent to: " + user.getEmail());
            } catch (Exception e) {
                System.err.println("❌ Failed to send approval email: " + e.getMessage());
            }
            
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
    
    // ===== DISABLE SELLER =====
    @PutMapping("/sellers/{sellerId}/disable")
    public ResponseEntity<?> disableSeller(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long sellerId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            User admin = userService.getUserByEmail(jwtUtil.extractEmail(authHeader.substring(7)));
            
            SellerProfile seller = sellerProfileRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            
            if (!seller.getIsActive()) {
                return ResponseEntity.badRequest().body("Seller is already disabled");
            }
            
            // Disable seller
            seller.setIsActive(false);
            seller.setUpdatedAt(LocalDateTime.now());
            sellerProfileRepository.save(seller);
            
            // Deactivate all seller's products
            List<Product> products = productRepository.findBySeller(seller);
            for (Product product : products) {
                product.setStatus(ProductStatus.INACTIVE);
                product.setUpdatedAt(LocalDateTime.now());
            }
            productRepository.saveAll(products);
            
            User sellerUser = seller.getUser();
            
            // Send email notification
            try {
                emailService.sendSellerDisabledEmail(
                    sellerUser.getEmail(),
                    sellerUser.getFirstName() + " " + sellerUser.getLastName(),
                    seller.getStoreName(),
                    admin.getFirstName() + " " + admin.getLastName()
                );
                System.out.println("✅ Disable email sent to: " + sellerUser.getEmail());
            } catch (Exception e) {
                System.err.println("❌ Failed to send disable email: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Seller disabled successfully. They can no longer sell but can still login and buy.");
            response.put("sellerId", sellerId);
            response.put("isActive", false);
            response.put("productsDeactivated", products.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ===== ENABLE SELLER =====
    @PutMapping("/sellers/{sellerId}/enable")
    public ResponseEntity<?> enableSeller(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long sellerId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            User admin = userService.getUserByEmail(jwtUtil.extractEmail(authHeader.substring(7)));
            
            SellerProfile seller = sellerProfileRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            
            if (seller.getIsActive()) {
                return ResponseEntity.badRequest().body("Seller is already enabled");
            }
            
            if (!seller.getIsApproved()) {
                return ResponseEntity.badRequest().body("Seller is not approved. Please approve first.");
            }
            
            // Enable seller
            seller.setIsActive(true);
            seller.setUpdatedAt(LocalDateTime.now());
            sellerProfileRepository.save(seller);
            
            // Reactivate all seller's products
            List<Product> products = productRepository.findBySeller(seller);
            for (Product product : products) {
                product.setStatus(ProductStatus.ACTIVE);
                product.setUpdatedAt(LocalDateTime.now());
            }
            productRepository.saveAll(products);
            
            User sellerUser = seller.getUser();
            
            // Send email notification
            try {
                emailService.sendSellerEnabledEmail(
                    sellerUser.getEmail(),
                    sellerUser.getFirstName() + " " + sellerUser.getLastName(),
                    seller.getStoreName(),
                    admin.getFirstName() + " " + admin.getLastName()
                );
                System.out.println("✅ Enable email sent to: " + sellerUser.getEmail());
            } catch (Exception e) {
                System.err.println("❌ Failed to send enable email: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Seller enabled successfully. They can now sell again.");
            response.put("sellerId", sellerId);
            response.put("isActive", true);
            response.put("productsActivated", products.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // ===== REMOVE SELLER =====
    @DeleteMapping("/sellers/{sellerId}/remove")
    public ResponseEntity<?> removeSeller(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long sellerId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            User admin = userService.getUserByEmail(jwtUtil.extractEmail(authHeader.substring(7)));
            
            SellerProfile seller = sellerProfileRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller not found"));
            
            User sellerUser = seller.getUser();
            String sellerEmail = sellerUser.getEmail();
            String sellerName = sellerUser.getFirstName() + " " + sellerUser.getLastName();
            String storeName = seller.getStoreName();
            
            // Deactivate all seller's products
            List<Product> products = productRepository.findBySeller(seller);
            for (Product product : products) {
                product.setStatus(ProductStatus.INACTIVE);
                product.setUpdatedAt(LocalDateTime.now());
            }
            productRepository.saveAll(products);
            
            // Soft delete seller profile (mark as not approved and not active)
            seller.setIsApproved(false);
            seller.setIsActive(false);
            seller.setUpdatedAt(LocalDateTime.now());
            sellerProfileRepository.save(seller);
            
            // Downgrade user to BUYER
            sellerUser.setUserType(UserType.BUYER);
            userRepository.save(sellerUser);
            
            // Send email notification
            try {
                emailService.sendSellerRemovedEmail(
                    sellerEmail,
                    sellerName,
                    storeName,
                    admin.getFirstName() + " " + admin.getLastName()
                );
                System.out.println("✅ Removal email sent to: " + sellerEmail);
            } catch (Exception e) {
                System.err.println("❌ Failed to send removal email: " + e.getMessage());
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Seller removed successfully. They have been downgraded to buyer.");
            response.put("sellerId", sellerId);
            response.put("userId", sellerUser.getId());
            response.put("userType", sellerUser.getUserType().name());
            response.put("productsDeactivated", products.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
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
    
    // ===== SELLER APPLICATION MANAGEMENT =====
    @GetMapping("/applications")
    public ResponseEntity<?> getPendingApplications(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            List<SellerApplicationResponse> applications = sellerApplicationService.getPendingApplications();
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/applications/{applicationId}/approve")
    public ResponseEntity<?> approveApplication(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long applicationId) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            Long adminId = getUserIdFromToken(authHeader);
            SellerApplicationResponse response = sellerApplicationService.approveApplication(applicationId, adminId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/applications/{applicationId}/reject")
    public ResponseEntity<?> rejectApplication(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> request) {
        if (!isAdmin(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }
        try {
            Long adminId = getUserIdFromToken(authHeader);
            String reason = request.get("reason");
            SellerApplicationResponse response = sellerApplicationService.rejectApplication(applicationId, adminId, reason);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}