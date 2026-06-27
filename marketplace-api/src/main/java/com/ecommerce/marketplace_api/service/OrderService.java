package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.CheckoutRequest;
import com.ecommerce.marketplace_api.dto.OrderItemResponse;
import com.ecommerce.marketplace_api.dto.OrderResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class OrderService {
    
    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05");
    private static final BigDecimal SHIPPING_COST = new BigDecimal("5.00");
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10");
    
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository, 
                        OrderItemRepository orderItemRepository, 
                        CartItemRepository cartItemRepository, 
                        ProductRepository productRepository, 
                        UserRepository userRepository, 
                        SellerProfileRepository sellerProfileRepository,
                        EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.emailService = emailService;
    }
    
    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<CartItem> cartItems = cartItemRepository.findByUser(buyer);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            subtotal = subtotal.add(item.getPriceAtAdd().multiply(BigDecimal.valueOf(item.getQuantity())));
        }
        
        BigDecimal taxAmount = subtotal.multiply(TAX_RATE);
        BigDecimal totalAmount = subtotal.add(SHIPPING_COST).add(taxAmount);
        BigDecimal platformCommission = subtotal.multiply(COMMISSION_RATE);
        
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setBuyer(buyer);
        order.setSubtotal(subtotal);
        order.setShippingCost(SHIPPING_COST);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(totalAmount);
        order.setPlatformCommission(platformCommission);
        order.setShippingAddress(request.getShippingAddress());
        order.setBillingAddress(request.getBillingAddress());
        order.setNotes(request.getNotes());
        
        if ("STRIPE".equalsIgnoreCase(request.getPaymentMethod())) {
            order.setPaymentMethod(PaymentMethod.STRIPE);
        } else if ("PAYPAL".equalsIgnoreCase(request.getPaymentMethod())) {
            order.setPaymentMethod(PaymentMethod.PAYPAL);
        } else {
            order.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Collect seller info for email notifications
        List<SellerInfo> sellerInfoList = new ArrayList<>();
        
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            SellerProfile seller = product.getSeller();
            
            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            product.setSalesCount(product.getSalesCount() + cartItem.getQuantity());
            productRepository.save(product);
            
            BigDecimal itemTotal = cartItem.getPriceAtAdd().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            BigDecimal itemCommission = itemTotal.multiply(COMMISSION_RATE);
            BigDecimal sellerNet = itemTotal.subtract(itemCommission);
            
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setSeller(seller);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(cartItem.getPriceAtAdd());
            orderItem.setTotalPrice(itemTotal);
            orderItem.setSellerCommission(itemCommission);
            orderItem.setSellerNetAmount(sellerNet);
            
            orderItemRepository.save(orderItem);
            
            seller.setTotalSales(seller.getTotalSales() + cartItem.getQuantity());
            sellerProfileRepository.save(seller);
            
            sellerInfoList.add(new SellerInfo(
                seller,
                product.getName(),
                cartItem.getQuantity(),
                itemTotal,
                sellerNet
            ));
        }
        
        cartItemRepository.deleteByUser(buyer);
        
        // Send email to all sellers
        sendSellerOrderNotifications(savedOrder, buyer, sellerInfoList);
        
        return convertToResponse(savedOrder);
    }
    
    // ===== SEND SELLER ORDER NOTIFICATIONS =====
    @SuppressWarnings("unchecked")
    private void sendSellerOrderNotifications(Order order, User buyer, List<SellerInfo> sellerInfoList) {
        try {
            System.out.println("📧 Sending order notifications to sellers...");
            
            String customerName = (buyer.getFirstName() != null ? buyer.getFirstName() : "") + 
                                 (buyer.getLastName() != null ? " " + buyer.getLastName() : "");
            if (customerName.trim().isEmpty()) {
                customerName = buyer.getEmail();
            }
            
            // Get shipping address
            String shippingAddress = "N/A";
            try {
                if (order.getShippingAddress() != null) {
                    ObjectMapper mapper = new ObjectMapper();
                    Map<String, String> address = mapper.readValue(order.getShippingAddress(), Map.class);
                    shippingAddress = address.getOrDefault("address", "N/A") + ", " + 
                                     address.getOrDefault("city", "N/A") + ", " + 
                                     address.getOrDefault("state", "N/A") + " " + 
                                     address.getOrDefault("zipCode", "N/A");
                }
            } catch (Exception e) {
                shippingAddress = "N/A";
            }
            
            for (SellerInfo info : sellerInfoList) {
                SellerProfile seller = info.seller;
                if (seller != null && seller.getUser() != null && seller.getUser().getEmail() != null) {
                    String sellerEmail = seller.getUser().getEmail();
                    
                    emailService.sendMarketplaceOrderNotificationToSeller(
                        sellerEmail,
                        seller.getStoreName() != null ? seller.getStoreName() : "Seller",
                        info.productName,
                        "eStore",
                        order.getOrderNumber(),
                        info.quantity,
                        info.itemTotal.doubleValue(),
                        info.sellerNet.doubleValue(),
                        customerName,
                        shippingAddress,
                        order.getCreatedAt() != null ? order.getCreatedAt().toString() : "N/A"
                    );
                    
                    System.out.println("✅ Seller notification sent to: " + sellerEmail);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send seller notifications: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // ===== INNER CLASS FOR SELLER INFO =====
    private static class SellerInfo {
        SellerProfile seller;
        String productName;
        int quantity;
        BigDecimal itemTotal;
        BigDecimal sellerNet;
        
        SellerInfo(SellerProfile seller, String productName, int quantity, BigDecimal itemTotal, BigDecimal sellerNet) {
            this.seller = seller;
            this.productName = productName;
            this.quantity = quantity;
            this.itemTotal = itemTotal;
            this.sellerNet = sellerNet;
        }
    }
    
    public List<OrderResponse> getUserOrders(Long userId) {
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Order> orders = orderRepository.findByBuyer(buyer);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<OrderResponse> getSellerOrders(Long userId) {
        System.out.println("=== getSellerOrders ===");
        System.out.println("Looking for orders with seller user ID: " + userId);
        
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found for user: " + userId));
        
        System.out.println("Found seller profile ID: " + seller.getId());
        
        List<Order> allOrders = orderRepository.findAll();
        List<Order> sellerOrders = new ArrayList<>();
        
        for (Order order : allOrders) {
            List<OrderItem> items = orderItemRepository.findByOrder(order);
            for (OrderItem item : items) {
                if (item.getSeller().getId().equals(seller.getId())) {
                    sellerOrders.add(order);
                    break;
                }
            }
        }
        
        System.out.println("Found " + sellerOrders.size() + " orders with seller products");
        return sellerOrders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public OrderResponse getOrderById(Long userId, Long orderId) {
        @SuppressWarnings("unused")
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getBuyer().getId().equals(userId)) {
            throw new RuntimeException("You don't own this order");
        }
        
        return convertToResponse(order);
    }
    
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        @SuppressWarnings("unused")
        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!order.getBuyer().getId().equals(userId)) {
            throw new RuntimeException("You don't own this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Order cannot be cancelled at this stage");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        for (OrderItem item : orderItems) {
            Product product = item.getProduct();
            if (product != null) {
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
        
        Order saved = orderRepository.save(order);
        return convertToResponse(saved);
    }

    public boolean hasUserPurchasedProduct(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Order> orders = orderRepository.findByBuyer(user);
        
        for (Order order : orders) {
            if (order.getStatus() == OrderStatus.PAID || 
                order.getStatus() == OrderStatus.PROCESSING ||
                order.getStatus() == OrderStatus.SHIPPED || 
                order.getStatus() == OrderStatus.DELIVERED) {
                
                List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
                boolean productFound = orderItems.stream()
                    .anyMatch(item -> item.getProduct() != null && 
                                     item.getProduct().getId().equals(productId));
                if (productFound) {
                    return true;
                }
            }
        }
        return false;
    }
    
    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    // ===== CONVERT TO RESPONSE - FIXED WITH BUYER INFO =====
    private OrderResponse convertToResponse(Order order) {
        List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
        List<OrderItemResponse> itemResponses = orderItems.stream()
                .map(this::convertToItemResponse)
                .collect(Collectors.toList());
        
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setTotalAmount(order.getTotalAmount());
        response.setSubtotal(order.getSubtotal());
        response.setShippingCost(order.getShippingCost());
        response.setTaxAmount(order.getTaxAmount());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setStatus(order.getStatus().name());
        response.setPaymentMethod(order.getPaymentMethod().name());
        response.setPaymentStatus(order.getPaymentStatus().name());
        response.setPaidAt(order.getPaidAt());
        response.setCreatedAt(order.getCreatedAt());
        response.setItems(itemResponses);
        
        // ✅ FIX: Set shipping address
        if (order.getShippingAddress() != null) {
            response.setShippingAddress(order.getShippingAddress());
        }
        
        // ✅ FIX: Set buyer info
        User buyer = order.getBuyer();
        if (buyer != null) {
            String firstName = buyer.getFirstName() != null ? buyer.getFirstName() : "";
            String lastName = buyer.getLastName() != null ? buyer.getLastName() : "";
            String fullName = (firstName + " " + lastName).trim();
            response.setBuyerName(fullName.isEmpty() ? buyer.getEmail() : fullName);
            response.setBuyerEmail(buyer.getEmail());
        }
        
        return response;
    }
    
    private OrderItemResponse convertToItemResponse(OrderItem item) {
        String productImage = null;
        if (item.getProduct() != null && item.getProduct().getImages() != null) {
            try {
                String images = item.getProduct().getImages();
                if (images != null && images.contains("\"")) {
                    productImage = images.split("\"")[1];
                }
            } catch (Exception e) {
                productImage = null;
            }
        }
        
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
        response.setProductName(item.getProductName());
        response.setProductImage(productImage);
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setTotalPrice(item.getTotalPrice());
        response.setSellerId(item.getSeller().getId());
        response.setStoreName(item.getSeller().getStoreName());
        response.setStatus(item.getStatus().name());
        
        return response;
    }
}