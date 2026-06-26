package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.PaymentResponse;
import com.ecommerce.marketplace_api.model.Order;
import com.ecommerce.marketplace_api.model.OrderStatus;
import com.ecommerce.marketplace_api.model.PaymentStatus;
import com.ecommerce.marketplace_api.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@SuppressWarnings("unused")
@Service
public class PaymentService {
    
    private final OrderRepository orderRepository;
    
    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    PaymentService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

   @PostConstruct
public void init() {
    Stripe.apiKey = "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";
    System.out.println("✅ Stripe API key initialized");
}
    
    @Transactional
    public PaymentResponse createPaymentIntent(Long orderId) throws StripeException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        long amountInCents = order.getTotalAmount().multiply(new java.math.BigDecimal("100")).longValue();
        
        System.out.println("Creating payment intent for order: " + order.getOrderNumber());
        System.out.println("Amount: " + amountInCents + " cents");
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setDescription("Order #" + order.getOrderNumber())
                .putMetadata("orderId", order.getId().toString())
                .putMetadata("orderNumber", order.getOrderNumber())
                .build();
        
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        System.out.println("Payment Intent created: " + paymentIntent.getId());
        
        order.setPaymentIntentId(paymentIntent.getId());
        orderRepository.save(order);
        
        return new PaymentResponse(
            paymentIntent.getClientSecret(),
            paymentIntent.getId(),
            paymentIntent.getStatus()
        );
    }
    
    @Transactional
    public void handlePaymentSuccess(String paymentIntentId) {
        System.out.println("=== HANDLING PAYMENT SUCCESS ===");
        System.out.println("Looking for paymentIntentId: " + paymentIntentId);
        
        Order order = orderRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Order not found for paymentIntentId: " + paymentIntentId));
        
        System.out.println("Found order: " + order.getOrderNumber() + ", current status: " + order.getStatus());
        
        order.setPaymentStatus(PaymentStatus.COMPLETED);
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        orderRepository.save(order);
        
        System.out.println("Order " + order.getOrderNumber() + " updated to PAID");
        System.out.println("=== PAYMENT SUCCESS HANDLED ===");
    }
    
    public PaymentResponse confirmPayment(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        
        return new PaymentResponse(
            paymentIntent.getClientSecret(),
            paymentIntent.getId(),
            paymentIntent.getStatus()
        );
    }
    
    @Transactional
    public void handleWebhookEvent(String payload, String sigHeader) {
        System.out.println("=== WEBHOOK RECEIVED ===");
        System.out.println("Payload: " + payload);
        
        if (payload.contains("payment_intent.succeeded")) {
            System.out.println("Found payment_intent.succeeded in payload");
            String paymentIntentId = extractPaymentIntentId(payload);
            System.out.println("Extracted PaymentIntent ID: '" + paymentIntentId + "'");
            
            if (paymentIntentId != null) {
                handlePaymentSuccess(paymentIntentId);
            } else {
                System.out.println("Extraction returned null - trying manual extraction");
                int piIndex = payload.indexOf("pi_");
                if (piIndex != -1) {
                    int end = payload.indexOf("\"", piIndex);
                    if (end == -1) {
                        end = payload.length();
                    }
                    String manualId = payload.substring(piIndex, end);
                    System.out.println("Manually extracted ID: '" + manualId + "'");
                    handlePaymentSuccess(manualId);
                } else {
                    System.out.println("No pi_ found in payload");
                }
            }
        } else {
            System.out.println("No payment_intent.succeeded found in payload");
        }
        System.out.println("=== WEBHOOK PROCESSING COMPLETE ===");
    }
    
    private String extractPaymentIntentId(String payload) {
        String searchFor = "\"id\":\"pi_";
        int start = payload.indexOf(searchFor);
        if (start == -1) {
            System.out.println("Pattern '\"id\":\"pi_' not found");
            return null;
        }
        start = start + searchFor.length();
        int end = payload.indexOf("\"", start);
        if (end == -1) {
            System.out.println("Closing quote not found");
            return null;
        }
        String extracted = "pi_" + payload.substring(start, end);
        System.out.println("Extracted using pattern: " + extracted);
        return extracted;
    }
}