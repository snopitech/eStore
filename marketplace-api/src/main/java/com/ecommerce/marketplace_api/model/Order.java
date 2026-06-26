package com.ecommerce.marketplace_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;
    
    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;
    
    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;
    
    private BigDecimal subtotal;
    
    @Column(name = "shipping_cost")
    private BigDecimal shippingCost = BigDecimal.ZERO;
    
    @Column(name = "tax_amount")
    private BigDecimal taxAmount = BigDecimal.ZERO;
    
    @Column(name = "discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "platform_commission")
    private BigDecimal platformCommission = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;
    
    @Column(name = "payment_intent_id")
    private String paymentIntentId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    @Column(name = "shipping_address", columnDefinition = "JSON")
    private String shippingAddress;
    
    @Column(name = "billing_address", columnDefinition = "JSON")
    private String billingAddress;
    
    @Column(name = "tracking_number")
    private String trackingNumber;
    
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ===== NEW: MULTI-CHANNEL / MARKETPLACE FIELDS =====
    
    @Column(name = "marketplace")
    private String marketplace; // 'ESTORE', 'AMAZON', 'WALMART', 'EBAY'
    
    @Column(name = "marketplace_order_id")
    private String marketplaceOrderId;
    
    @Column(name = "marketplace_fee")
    private BigDecimal marketplaceFee = BigDecimal.ZERO;
    
    @Column(name = "seller_commission")
    private BigDecimal sellerCommission = BigDecimal.ZERO;
    
    @Column(name = "seller_payout_amount")
    private BigDecimal sellerPayoutAmount;
    
    @Column(name = "payout_status")
    private String payoutStatus = "PENDING"; // PENDING, PROCESSED, COMPLETED
    
    @Column(name = "payout_date")
    private LocalDateTime payoutDate;
    
    @Column(name = "is_synced")
    private Boolean isSynced = false;
    
    @Column(name = "synced_at")
    private LocalDateTime syncedAt;
    
    public Order() {}
    
    // ===== EXISTING GETTERS =====
    public Long getId() { return id; }
    public String getOrderNumber() { return orderNumber; }
    public User getBuyer() { return buyer; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getShippingCost() { return shippingCost; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public BigDecimal getPlatformCommission() { return platformCommission; }
    public OrderStatus getStatus() { return status; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public String getPaymentIntentId() { return paymentIntentId; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public String getShippingAddress() { return shippingAddress; }
    public String getBillingAddress() { return billingAddress; }
    public String getTrackingNumber() { return trackingNumber; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    // ===== EXISTING SETTERS =====
    public void setId(Long id) { this.id = id; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public void setBuyer(User buyer) { this.buyer = buyer; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    public void setShippingCost(BigDecimal shippingCost) { this.shippingCost = shippingCost; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public void setPlatformCommission(BigDecimal platformCommission) { this.platformCommission = platformCommission; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public void setNotes(String notes) { this.notes = notes; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // ===== NEW: MULTI-CHANNEL GETTERS AND SETTERS =====
    
    public String getMarketplace() { return marketplace; }
    public void setMarketplace(String marketplace) { this.marketplace = marketplace; }
    
    public String getMarketplaceOrderId() { return marketplaceOrderId; }
    public void setMarketplaceOrderId(String marketplaceOrderId) { this.marketplaceOrderId = marketplaceOrderId; }
    
    public BigDecimal getMarketplaceFee() { return marketplaceFee; }
    public void setMarketplaceFee(BigDecimal marketplaceFee) { this.marketplaceFee = marketplaceFee; }
    
    public BigDecimal getSellerCommission() { return sellerCommission; }
    public void setSellerCommission(BigDecimal sellerCommission) { this.sellerCommission = sellerCommission; }
    
    public BigDecimal getSellerPayoutAmount() { return sellerPayoutAmount; }
    public void setSellerPayoutAmount(BigDecimal sellerPayoutAmount) { this.sellerPayoutAmount = sellerPayoutAmount; }
    
    public String getPayoutStatus() { return payoutStatus; }
    public void setPayoutStatus(String payoutStatus) { this.payoutStatus = payoutStatus; }
    
    public LocalDateTime getPayoutDate() { return payoutDate; }
    public void setPayoutDate(LocalDateTime payoutDate) { this.payoutDate = payoutDate; }
    
    public Boolean getIsSynced() { return isSynced; }
    public void setIsSynced(Boolean isSynced) { this.isSynced = isSynced; }
    
    public LocalDateTime getSyncedAt() { return syncedAt; }
    public void setSyncedAt(LocalDateTime syncedAt) { this.syncedAt = syncedAt; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (marketplace == null) {
            marketplace = "ESTORE";
        }
        if (payoutStatus == null) {
            payoutStatus = "PENDING";
        }
        if (isSynced == null) {
            isSynced = false;
        }
        if (marketplaceFee == null) {
            marketplaceFee = BigDecimal.ZERO;
        }
        if (sellerCommission == null) {
            sellerCommission = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}