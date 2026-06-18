package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.PaymentRequest;
import com.ecommerce.marketplace_api.dto.PaymentResponse;
import com.ecommerce.marketplace_api.service.PaymentService;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import com.stripe.exception.StripeException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    private final UserService userService;
    
    private final JwtUtil jwtUtil;

    PaymentController(PaymentService paymentService, UserService userService, JwtUtil jwtUtil) {
        this.paymentService = paymentService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
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
    
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody PaymentRequest request) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            PaymentResponse response = paymentService.createPaymentIntent(request.getOrderId());
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Stripe error: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/confirm/{paymentIntentId}")
    public ResponseEntity<?> confirmPayment(@PathVariable String paymentIntentId) {
        try {
            PaymentResponse response = paymentService.confirmPayment(paymentIntentId);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body("Stripe error: " + e.getMessage());
        }
    }
    
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        try {
            paymentService.handleWebhookEvent(payload, sigHeader);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}