package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.AnalyticsService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AnalyticsController(AnalyticsService analyticsService,
                               UserRepository userRepository,
                               JwtUtil jwtUtil) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getUserType() != UserType.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
        return user;
    }

    /**
     * Get sales overview
     * GET /api/analytics/sales
     */
    @GetMapping("/sales")
    public ResponseEntity<?> getSalesOverview(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            Map<String, Object> response = analyticsService.getSalesOverview();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get revenue over time
     * GET /api/analytics/revenue?period=month
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueOverTime(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "month") String period) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            Map<String, Object> response = analyticsService.getRevenueOverTime(period);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get top products
     * GET /api/analytics/top-products?limit=10
     */
    @GetMapping("/top-products")
    public ResponseEntity<?> getTopProducts(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            return ResponseEntity.ok(analyticsService.getTopProducts(limit));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get top categories
     * GET /api/analytics/top-categories
     */
    @GetMapping("/top-categories")
    public ResponseEntity<?> getTopCategories(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            return ResponseEntity.ok(analyticsService.getTopCategories());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get sales by marketplace
     * GET /api/analytics/marketplace
     */
    @GetMapping("/marketplace")
    public ResponseEntity<?> getSalesByMarketplace(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            Map<String, Object> response = analyticsService.getSalesByMarketplace();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get commission summary
     * GET /api/analytics/commission
     */
    @GetMapping("/commission")
    public ResponseEntity<?> getCommissionSummary(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            Map<String, Object> response = analyticsService.getCommissionSummary();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get customer insights
     * GET /api/analytics/customers
     */
    @GetMapping("/customers")
    public ResponseEntity<?> getCustomerInsights(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            Map<String, Object> response = analyticsService.getCustomerInsights();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get inventory status
     * GET /api/analytics/inventory
     */
    @GetMapping("/inventory")
    public ResponseEntity<?> getInventoryStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            Map<String, Object> response = analyticsService.getInventoryStatus();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all analytics in one call
     * GET /api/analytics/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardAnalytics(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);

            Map<String, Object> response = new java.util.HashMap<>();
            response.put("salesOverview", analyticsService.getSalesOverview());
            response.put("revenueOverTime", analyticsService.getRevenueOverTime("month"));
            response.put("topProducts", analyticsService.getTopProducts(5));
            response.put("salesByMarketplace", analyticsService.getSalesByMarketplace());
            response.put("commissionSummary", analyticsService.getCommissionSummary());
            response.put("customerInsights", analyticsService.getCustomerInsights());
            response.put("inventoryStatus", analyticsService.getInventoryStatus());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
