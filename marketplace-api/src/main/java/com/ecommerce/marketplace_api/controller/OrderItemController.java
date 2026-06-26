package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.OrderItem;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.OrderItemRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OrderItemController(OrderItemRepository orderItemRepository,
                               ProductRepository productRepository,
                               UserRepository userRepository,
                               JwtUtil jwtUtil) {
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @SuppressWarnings("unused")
    @PostMapping
    public ResponseEntity<?> createOrderItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getAuthenticatedUser(authHeader);
            
            Long productId = Long.valueOf(request.get("productId").toString());
            int quantity = Integer.valueOf(request.get("quantity").toString());
            double unitPrice = Double.valueOf(request.get("unitPrice").toString());
            
            var product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(1L);
            orderItem.setSellerId(12L);
            orderItem.setProductId(productId);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(BigDecimal.valueOf(unitPrice));
            orderItem.setTotalPrice(BigDecimal.valueOf(unitPrice * quantity));
            orderItem.setStatus(com.ecommerce.marketplace_api.model.OrderItemStatus.CONFIRMED);
            orderItem.setCreatedAt(LocalDateTime.now());
            orderItem.setUpdatedAt(LocalDateTime.now());
            
            OrderItem saved = orderItemRepository.save(orderItem);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("message", "Order item created successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}