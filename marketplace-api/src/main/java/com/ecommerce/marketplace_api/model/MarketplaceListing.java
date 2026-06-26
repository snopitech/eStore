package com.ecommerce.marketplace_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marketplace_listings")
public class MarketplaceListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "marketplace", nullable = false)
    private String marketplace; // AMAZON, WALMART, EBAY, TIKTOK, ETSY

    @Column(name = "marketplace_product_id")
    private String marketplaceProductId;

    @Column(name = "marketplace_sku")
    private String marketplaceSku;

    @Column(name = "listing_price")
    private BigDecimal listingPrice;

    @Column(name = "listing_status")
    private String listingStatus = "DRAFT"; // DRAFT, ACTIVE, INACTIVE, DELETED

    @Column(name = "listing_url")
    private String listingUrl;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;

    @Column(name = "sync_status")
    private String syncStatus = "PENDING"; // PENDING, SYNCED, FAILED

    @Column(name = "sync_error")
    private String syncError;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== CONSTRUCTORS =====

    public MarketplaceListing() {}

    public MarketplaceListing(Product product, String marketplace) {
        this.product = product;
        this.marketplace = marketplace;
        this.listingStatus = "DRAFT";
        this.isActive = true;
        this.syncStatus = "PENDING";
    }

    // ===== GETTERS AND SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getMarketplace() { return marketplace; }
    public void setMarketplace(String marketplace) { this.marketplace = marketplace; }

    public String getMarketplaceProductId() { return marketplaceProductId; }
    public void setMarketplaceProductId(String marketplaceProductId) { this.marketplaceProductId = marketplaceProductId; }

    public String getMarketplaceSku() { return marketplaceSku; }
    public void setMarketplaceSku(String marketplaceSku) { this.marketplaceSku = marketplaceSku; }

    public BigDecimal getListingPrice() { return listingPrice; }
    public void setListingPrice(BigDecimal listingPrice) { this.listingPrice = listingPrice; }

    public String getListingStatus() { return listingStatus; }
    public void setListingStatus(String listingStatus) { this.listingStatus = listingStatus; }

    public String getListingUrl() { return listingUrl; }
    public void setListingUrl(String listingUrl) { this.listingUrl = listingUrl; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getLastSyncAt() { return lastSyncAt; }
    public void setLastSyncAt(LocalDateTime lastSyncAt) { this.lastSyncAt = lastSyncAt; }

    public String getSyncStatus() { return syncStatus; }
    public void setSyncStatus(String syncStatus) { this.syncStatus = syncStatus; }

    public String getSyncError() { return syncError; }
    public void setSyncError(String syncError) { this.syncError = syncError; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}