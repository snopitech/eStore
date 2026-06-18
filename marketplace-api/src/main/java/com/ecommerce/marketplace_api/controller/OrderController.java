package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.CheckoutRequest;
import com.ecommerce.marketplace_api.dto.OrderResponse;
import com.ecommerce.marketplace_api.model.Order;
import com.ecommerce.marketplace_api.model.OrderStatus;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.OrderRepository;
import com.ecommerce.marketplace_api.service.OrderService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    private final OrderService orderService;
    
    private final UserService userService;
    
    private final JwtUtil jwtUtil;
    
    private final OrderRepository orderRepository;

    OrderController(OrderService orderService, UserService userService, JwtUtil jwtUtil, OrderRepository orderRepository) {
        this.orderService = orderService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.orderRepository = orderRepository;
    }
    
    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return 1L;
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userService.getUserByEmail(email);
        return user.getId();
    }
    
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CheckoutRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            OrderResponse response = orderService.checkout(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getMyOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            List<OrderResponse> orders = orderService.getUserOrders(userId);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/seller/orders")
    public ResponseEntity<?> getSellerOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            System.out.println("=== GET SELLER ORDERS ===");
            System.out.println("User ID: " + userId);
            List<OrderResponse> orders = orderService.getSellerOrders(userId);
            System.out.println("Returning " + orders.size() + " orders for seller");
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            System.out.println("Error in getSellerOrders: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            OrderResponse order = orderService.getOrderById(userId, id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            Order order = orderRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            
            String newStatus = request.get("status");
            order.setStatus(OrderStatus.valueOf(newStatus));
            orderRepository.save(order);
            
            return ResponseEntity.ok("Order status updated");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            OrderResponse order = orderService.cancelOrder(userId, id);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}