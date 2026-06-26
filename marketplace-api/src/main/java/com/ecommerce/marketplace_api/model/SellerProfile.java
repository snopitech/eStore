package com.ecommerce.marketplace_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seller_profiles")
public class SellerProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "store_name", nullable = false)
    private String storeName;
    
    @Column(name = "store_slug", unique = true, nullable = false)
    private String storeSlug;
    
    @Column(name = "store_description", columnDefinition = "TEXT")
    private String storeDescription;
    
    @Column(name = "store_logo_url")
    private String storeLogoUrl;
    
    @Column(name = "store_banner_url")
    private String storeBannerUrl;
    
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "total_sales")
    private Integer totalSales = 0;
    
    @Column(name = "total_products")
    private Integer totalProducts = 0;
    
    @Column(name = "is_approved")
    private Boolean isApproved = true;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ===== PAYOUT FIELDS =====
    @Column(name = "payout_method")
    private String payoutMethod = "BANK";
    
    @Column(name = "payout_account_name")
    private String payoutAccountName;
    
    @Column(name = "payout_account_number")
    private String payoutAccountNumber;
    
    @Column(name = "payout_routing_number")
    private String payoutRoutingNumber;
    
    @Column(name = "payout_paypal_email")
    private String payoutPaypalEmail;
    
    @Column(name = "payout_email")
    private String payoutEmail;
    
    // ===== STRIPE CONNECT FIELDS =====
    @Column(name = "stripe_connect_account_id")
    private String stripeConnectAccountId;
    
    @Column(name = "stripe_connect_status")
    private String stripeConnectStatus = "PENDING";
    
    @Column(name = "stripe_connect_verified")
    private Boolean stripeConnectVerified = false;
    
    // ===== RATING FIELDS =====
    @Column(name = "total_reviews")
    private Integer totalReviews = 0;
    
    @Column(name = "positive_reviews")
    private Integer positiveReviews = 0;
    
    @Column(name = "average_rating")
    private BigDecimal averageRating = BigDecimal.ZERO;
    
    public SellerProfile() {}
    
    // ===== BASIC GETTERS AND SETTERS =====
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    
    public String getStoreSlug() { return storeSlug; }
    public void setStoreSlug(String storeSlug) { this.storeSlug = storeSlug; }
    
    public String getStoreDescription() { return storeDescription; }
    public void setStoreDescription(String storeDescription) { this.storeDescription = storeDescription; }
    
    public String getStoreLogoUrl() { return storeLogoUrl; }
    public void setStoreLogoUrl(String storeLogoUrl) { this.storeLogoUrl = storeLogoUrl; }
    
    public String getStoreBannerUrl() { return storeBannerUrl; }
    public void setStoreBannerUrl(String storeBannerUrl) { this.storeBannerUrl = storeBannerUrl; }
    
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    
    public Integer getTotalSales() { return totalSales; }
    public void setTotalSales(Integer totalSales) { this.totalSales = totalSales; }
    
    public Integer getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Integer totalProducts) { this.totalProducts = totalProducts; }
    
    public Boolean getIsApproved() { return isApproved; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // ===== PAYOUT GETTERS AND SETTERS =====
    
    public String getPayoutMethod() {
        return payoutMethod;
    }
    
    public void setPayoutMethod(String payoutMethod) {
        this.payoutMethod = payoutMethod;
    }
    
    public String getPayoutAccountName() {
        return payoutAccountName;
    }
    
    public void setPayoutAccountName(String payoutAccountName) {
        this.payoutAccountName = payoutAccountName;
    }
    
    public String getPayoutAccountNumber() {
        return payoutAccountNumber;
    }
    
    public void setPayoutAccountNumber(String payoutAccountNumber) {
        this.payoutAccountNumber = payoutAccountNumber;
    }
    
    public String getPayoutRoutingNumber() {
        return payoutRoutingNumber;
    }
    
    public void setPayoutRoutingNumber(String payoutRoutingNumber) {
        this.payoutRoutingNumber = payoutRoutingNumber;
    }
    
    public String getPayoutPaypalEmail() {
        return payoutPaypalEmail;
    }
    
    public void setPayoutPaypalEmail(String payoutPaypalEmail) {
        this.payoutPaypalEmail = payoutPaypalEmail;
    }
    
    public String getPayoutEmail() {
        return payoutEmail;
    }
    
    public void setPayoutEmail(String payoutEmail) {
        this.payoutEmail = payoutEmail;
    }
    
    // ===== STRIPE CONNECT GETTERS AND SETTERS =====
    
    public String getStripeConnectAccountId() {
        return stripeConnectAccountId;
    }
    
    public void setStripeConnectAccountId(String stripeConnectAccountId) {
        this.stripeConnectAccountId = stripeConnectAccountId;
    }
    
    public String getStripeConnectStatus() {
        return stripeConnectStatus;
    }
    
    public void setStripeConnectStatus(String stripeConnectStatus) {
        this.stripeConnectStatus = stripeConnectStatus;
    }
    
    public Boolean getStripeConnectVerified() {
        return stripeConnectVerified;
    }
    
    public void setStripeConnectVerified(Boolean stripeConnectVerified) {
        this.stripeConnectVerified = stripeConnectVerified;
    }
    
    // ===== RATING GETTERS AND SETTERS =====
    
    public Integer getTotalReviews() {
        return totalReviews;
    }
    
    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }
    
    public Integer getPositiveReviews() {
        return positiveReviews;
    }
    
    public void setPositiveReviews(Integer positiveReviews) {
        this.positiveReviews = positiveReviews;
    }
    
    public BigDecimal getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (payoutMethod == null) {
            payoutMethod = "BANK";
        }
        if (stripeConnectStatus == null) {
            stripeConnectStatus = "PENDING";
        }
        if (stripeConnectVerified == null) {
            stripeConnectVerified = false;
        }
        if (totalReviews == null) {
            totalReviews = 0;
        }
        if (positiveReviews == null) {
            positiveReviews = 0;
        }
        if (averageRating == null) {
            averageRating = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}