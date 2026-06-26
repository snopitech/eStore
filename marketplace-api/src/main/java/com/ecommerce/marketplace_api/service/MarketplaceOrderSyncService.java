package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.OrderRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MarketplaceOrderSyncService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    @SuppressWarnings("unused")
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final CommissionService commissionService;

    public MarketplaceOrderSyncService(OrderRepository orderRepository,
                                       ProductRepository productRepository,
                                       UserRepository userRepository,
                                       EmailService emailService,
                                       CommissionService commissionService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.commissionService = commissionService;
    }

    /**
     * Sync an order from a marketplace (Amazon, Walmart, eBay)
     */
    @Transactional
    public void syncMarketplaceOrder(
            String marketplace,
            String marketplaceOrderId,
            Long productId,
            int quantity,
            BigDecimal salePrice,
            String customerName,
            String customerEmail,
            String shippingAddress,
            String orderDate) {

        try {
            System.out.println("=== SYNCING MARKETPLACE ORDER ===");
            System.out.println("Marketplace: " + marketplace);
            System.out.println("Order ID: " + marketplaceOrderId);
            System.out.println("Product ID: " + productId);

            // 1. Get the product
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

            // 2. Get the seller
            SellerProfile sellerProfile = product.getSeller();
            if (sellerProfile == null) {
                throw new RuntimeException("Product has no seller associated");
            }
            User seller = sellerProfile.getUser();

            // 3. Calculate amounts
            BigDecimal totalAmount = salePrice.multiply(BigDecimal.valueOf(quantity));
            BigDecimal commissionAmount = commissionService.calculateCommission(totalAmount);
            BigDecimal sellerPayout = commissionService.calculateSellerPayout(totalAmount);

            // 4. Generate order number
            String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            // 5. Create order
            Order order = new Order();
            order.setOrderNumber(orderNumber);
            order.setBuyer(seller); // Buyer is not a real user, so we assign seller
            order.setTotalAmount(totalAmount);
            order.setSubtotal(totalAmount);
            order.setStatus(OrderStatus.PAID);
            order.setPaymentMethod(PaymentMethod.STRIPE);
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            order.setPaidAt(LocalDateTime.now());
            order.setShippingAddress(shippingAddress);
            order.setMarketplace(marketplace);
            order.setMarketplaceOrderId(marketplaceOrderId);
            order.setMarketplaceFee(BigDecimal.ZERO);
            order.setSellerCommission(commissionAmount);
            order.setSellerPayoutAmount(sellerPayout);
            order.setPayoutStatus("PENDING");
            order.setIsSynced(true);
            order.setSyncedAt(LocalDateTime.now());
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // Save order
            Order savedOrder = orderRepository.save(order);
            System.out.println("✅ Order created: " + orderNumber);

            // 6. Create commission record
            commissionService.createCommission(savedOrder, product, seller);

            // 7. Send email to seller
            try {
                emailService.sendMarketplaceOrderNotificationToSeller(
                        seller.getEmail(),
                        seller.getFirstName() + " " + seller.getLastName(),
                        product.getName(),
                        marketplace,
                        marketplaceOrderId,
                        quantity,
                        salePrice.doubleValue(),
                        sellerPayout.doubleValue(),
                        customerName,
                        shippingAddress,
                        orderDate
                );
                System.out.println("✅ Email sent to seller: " + seller.getEmail());
            } catch (Exception e) {
                System.err.println("❌ Failed to send email to seller: " + e.getMessage());
            }

            System.out.println("=== MARKETPLACE ORDER SYNC COMPLETE ===");

        } catch (Exception e) {
            System.err.println("❌ Failed to sync marketplace order: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to sync marketplace order: " + e.getMessage());
        }
    }

    /**
     * Simulate a marketplace order for testing (Amazon, Walmart, eBay)
     */
    @Transactional
    public void simulateMarketplaceOrder(String marketplace, Long productId, int quantity) {
        BigDecimal price = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"))
                .getPrice();

        String orderId = marketplace.substring(0, 3).toUpperCase() + "-" + UUID.randomUUID().toString().substring(0, 10);

        syncMarketplaceOrder(
                marketplace,
                orderId,
                productId,
                quantity,
                price,
                "Test Customer",
                "test@customer.com",
                "123 Test St, Test City, TX 12345",
                LocalDateTime.now().toString()
        );
    }
}