package com.ecommerce.marketplace_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "commissions")
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "marketplace")
    private String marketplace; // ESTORE, AMAZON, WALMART, EBAY

    @Column(name = "commission_rate", nullable = false)
    private BigDecimal commissionRate = new BigDecimal("5.00");

    @Column(name = "commission_amount", nullable = false)
    private BigDecimal commissionAmount;

    @Column(name = "seller_payout_amount")
    private BigDecimal sellerPayoutAmount;

    @Column(name = "marketplace_fee")
    private BigDecimal marketplaceFee = BigDecimal.ZERO;

    @Column(name = "status")
    private String status = "PENDING"; // PENDING, PAID, FAILED

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== CONSTRUCTORS =====

    public Commission() {}

    public Commission(Order order, Product product, User seller, BigDecimal commissionAmount) {
        this.order = order;
        this.product = product;
        this.seller = seller;
        this.commissionAmount = commissionAmount;
        this.commissionRate = new BigDecimal("5.00");
        this.status = "PENDING";
        this.marketplace = "ESTORE";
    }

    // ===== GETTERS AND SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public String getMarketplace() { return marketplace; }
    public void setMarketplace(String marketplace) { this.marketplace = marketplace; }

    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public BigDecimal getSellerPayoutAmount() { return sellerPayoutAmount; }
    public void setSellerPayoutAmount(BigDecimal sellerPayoutAmount) { this.sellerPayoutAmount = sellerPayoutAmount; }

    public BigDecimal getMarketplaceFee() { return marketplaceFee; }
    public void setMarketplaceFee(BigDecimal marketplaceFee) { this.marketplaceFee = marketplaceFee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
        if (marketplace == null) {
            marketplace = "ESTORE";
        }
        if (marketplaceFee == null) {
            marketplaceFee = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
