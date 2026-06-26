package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.MarketplaceOrderSyncService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/orders")
public class MarketplaceOrderController {

    private final MarketplaceOrderSyncService marketplaceOrderSyncService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public MarketplaceOrderController(MarketplaceOrderSyncService marketplaceOrderSyncService,
                                      UserRepository userRepository,
                                      JwtUtil jwtUtil) {
        this.marketplaceOrderSyncService = marketplaceOrderSyncService;
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
     * Simulate a marketplace order (for testing)
     * POST /api/marketplace/orders/simulate
     */
    @PostMapping("/simulate")
    public ResponseEntity<?> simulateMarketplaceOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {

        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);

            String marketplace = (String) request.get("marketplace");
            Long productId = Long.valueOf(request.get("productId").toString());
            int quantity = request.containsKey("quantity") ? Integer.valueOf(request.get("quantity").toString()) : 1;

            if (marketplace == null || marketplace.isEmpty()) {
                return ResponseEntity.badRequest().body("Marketplace is required");
            }

            marketplaceOrderSyncService.simulateMarketplaceOrder(marketplace, productId, quantity);

            Map<String, String> response = new HashMap<>();
            response.put("message", "✅ Marketplace order simulated successfully!");
            response.put("marketplace", marketplace);
            response.put("productId", productId.toString());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Sync a real marketplace order (webhook endpoint)
     * POST /api/marketplace/orders/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> webhook(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("=== MARKETPLACE WEBHOOK RECEIVED ===");
            System.out.println("Payload: " + payload);

            String marketplace = (String) payload.get("marketplace");
            String marketplaceOrderId = (String) payload.get("orderId");
            Long productId = Long.valueOf(payload.get("productId").toString());
            int quantity = Integer.valueOf(payload.get("quantity").toString());
            BigDecimal salePrice = new BigDecimal(payload.get("price").toString());
            String customerName = (String) payload.get("customerName");
            String customerEmail = (String) payload.get("customerEmail");
            String shippingAddress = (String) payload.get("shippingAddress");
            String orderDate = (String) payload.get("orderDate");

            marketplaceOrderSyncService.syncMarketplaceOrder(
                marketplace,
                marketplaceOrderId,
                productId,
                quantity,
                salePrice,
                customerName,
                customerEmail,
                shippingAddress,
                orderDate
            );

            Map<String, String> response = new HashMap<>();
            response.put("message", "Webhook processed successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Webhook error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Webhook error: " + e.getMessage());
        }
    }
}