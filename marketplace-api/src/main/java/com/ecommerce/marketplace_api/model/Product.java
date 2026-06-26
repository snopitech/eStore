package com.ecommerce.marketplace_api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private SellerProfile seller;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "short_description")
    private String shortDescription;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(name = "compare_at_price")
    private BigDecimal compareAtPrice;
    
    private Integer quantity = 0;
    
    @Column(unique = true)
    private String sku;
    
    @Column(columnDefinition = "JSON")
    private String images;
    
    @Column(columnDefinition = "JSON")
    private String specifications;
    
    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.DRAFT;
    
    @Column(name = "views_count")
    private Integer viewsCount = 0;
    
    @Column(name = "sales_count")
    private Integer salesCount = 0;
    
    private BigDecimal rating = BigDecimal.ZERO;
    
    @Column(name = "reviews_count")
    private Integer reviewsCount = 0;
    
    @Column(name = "is_featured")
    private Boolean isFeatured = false;
    
    @Column(name = "published_at")
    private LocalDateTime publishedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // ===== LIVE STREAMING FIELDS =====
    @Column(name = "is_live")
    private Boolean isLive = false;
    
    @Column(name = "live_price")
    private BigDecimal livePrice;
    
    @Column(name = "live_start_time")
    private LocalDateTime liveStartTime;
    
    @Column(name = "live_end_time")
    private LocalDateTime liveEndTime;
    
    @Column(name = "viewer_count")
    private Integer viewerCount = 0;
    
    // ===== MULTI-CHANNEL / MARKETPLACE FIELDS =====
    
    // Inventory Source (Wholesale)
    @Column(name = "inventory_source_id")
    private Long inventorySourceId;
    
    @Column(name = "supplier_price")
    private BigDecimal supplierPrice;
    
    @Column(name = "commission_rate")
    private BigDecimal commissionRate = new BigDecimal("5.00");
    
    // Marketplace Listing Status
    @Column(name = "amazon_listed")
    private Boolean amazonListed = false;
    
    @Column(name = "walmart_listed")
    private Boolean walmartListed = false;
    
    @Column(name = "ebay_listed")
    private Boolean ebayListed = false;
    
    @Column(name = "tiktok_listed")
    private Boolean tiktokListed = false;
    
    @Column(name = "google_listed")
    private Boolean googleListed = false;
    
    @Column(name = "etsy_listed")
    private Boolean etsyListed = false;
    
    // Marketplace Prices
    @Column(name = "amazon_price")
    private BigDecimal amazonPrice;
    
    @Column(name = "walmart_price")
    private BigDecimal walmartPrice;
    
    @Column(name = "ebay_price")
    private BigDecimal ebayPrice;
    
    // Marketplace SKUs
    @Column(name = "amazon_sku")
    private String amazonSku;
    
    @Column(name = "walmart_sku")
    private String walmartSku;
    
    @Column(name = "ebay_sku")
    private String ebaySku;
    
    // Sync Tracking
    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;
    
    @Column(name = "is_dropshipping")
    private Boolean isDropshipping = false;
    
    // ===== ADVANCED SEARCH FIELDS =====
    @Column(name = "product_condition")
    private String productCondition; // NEW, LIKE_NEW, EXCELLENT, GOOD, ACCEPTABLE, REFURBISHED
    
    @Column(name = "brand")
    private String brand;
    
    @Column(name = "model")
    private String model;
    
    @Column(name = "color")
    private String color;
    
    @Column(name = "weight")
    private Double weight;
    
    @Column(name = "dimensions")
    private String dimensions;
    
    @Column(name = "is_auction")
    private Boolean isAuction = false;
    
    @Column(name = "auction_end_time")
    private LocalDateTime auctionEndTime;
    
    @Column(name = "starting_bid")
    private BigDecimal startingBid;
    
    @Column(name = "current_bid")
    private BigDecimal currentBid;
    
    public Product() {}
    
    // ===== EXISTING GETTERS AND SETTERS =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public SellerProfile getSeller() { return seller; }
    public void setSeller(SellerProfile seller) { this.seller = seller; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public BigDecimal getCompareAtPrice() { return compareAtPrice; }
    public void setCompareAtPrice(BigDecimal compareAtPrice) { this.compareAtPrice = compareAtPrice; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    
    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }
    
    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }
    
    public Integer getViewsCount() { return viewsCount; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }
    
    public Integer getSalesCount() { return salesCount; }
    public void setSalesCount(Integer salesCount) { this.salesCount = salesCount; }
    
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    
    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }
    
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // ===== LIVE STREAMING GETTERS AND SETTERS =====
    public Boolean getIsLive() { return isLive; }
    public void setIsLive(Boolean isLive) { this.isLive = isLive; }
    
    public BigDecimal getLivePrice() { return livePrice; }
    public void setLivePrice(BigDecimal livePrice) { this.livePrice = livePrice; }
    
    public LocalDateTime getLiveStartTime() { return liveStartTime; }
    public void setLiveStartTime(LocalDateTime liveStartTime) { this.liveStartTime = liveStartTime; }
    
    public LocalDateTime getLiveEndTime() { return liveEndTime; }
    public void setLiveEndTime(LocalDateTime liveEndTime) { this.liveEndTime = liveEndTime; }
    
    public Integer getViewerCount() { return viewerCount; }
    public void setViewerCount(Integer viewerCount) { this.viewerCount = viewerCount; }
    
    // ===== MULTI-CHANNEL GETTERS AND SETTERS =====
    
    public Long getInventorySourceId() { return inventorySourceId; }
    public void setInventorySourceId(Long inventorySourceId) { this.inventorySourceId = inventorySourceId; }
    
    public BigDecimal getSupplierPrice() { return supplierPrice; }
    public void setSupplierPrice(BigDecimal supplierPrice) { this.supplierPrice = supplierPrice; }
    
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
    
    public Boolean getAmazonListed() { return amazonListed; }
    public void setAmazonListed(Boolean amazonListed) { this.amazonListed = amazonListed; }
    
    public Boolean getWalmartListed() { return walmartListed; }
    public void setWalmartListed(Boolean walmartListed) { this.walmartListed = walmartListed; }
    
    public Boolean getEbayListed() { return ebayListed; }
    public void setEbayListed(Boolean ebayListed) { this.ebayListed = ebayListed; }
    
    public Boolean getTikTokListed() { return tiktokListed; }
    public void setTikTokListed(Boolean tiktokListed) { this.tiktokListed = tiktokListed; }
    
    public Boolean getGoogleListed() { return googleListed; }
    public void setGoogleListed(Boolean googleListed) { this.googleListed = googleListed; }
    
    public Boolean getEtsyListed() { return etsyListed; }
    public void setEtsyListed(Boolean etsyListed) { this.etsyListed = etsyListed; }
    
    public BigDecimal getAmazonPrice() { return amazonPrice; }
    public void setAmazonPrice(BigDecimal amazonPrice) { this.amazonPrice = amazonPrice; }
    
    public BigDecimal getWalmartPrice() { return walmartPrice; }
    public void setWalmartPrice(BigDecimal walmartPrice) { this.walmartPrice = walmartPrice; }
    
    public BigDecimal getEbayPrice() { return ebayPrice; }
    public void setEbayPrice(BigDecimal ebayPrice) { this.ebayPrice = ebayPrice; }
    
    public String getAmazonSku() { return amazonSku; }
    public void setAmazonSku(String amazonSku) { this.amazonSku = amazonSku; }
    
    public String getWalmartSku() { return walmartSku; }
    public void setWalmartSku(String walmartSku) { this.walmartSku = walmartSku; }
    
    public String getEbaySku() { return ebaySku; }
    public void setEbaySku(String ebaySku) { this.ebaySku = ebaySku; }
    
    public LocalDateTime getLastSyncAt() { return lastSyncAt; }
    public void setLastSyncAt(LocalDateTime lastSyncAt) { this.lastSyncAt = lastSyncAt; }
    
    public Boolean getIsDropshipping() { return isDropshipping; }
    public void setIsDropshipping(Boolean isDropshipping) { this.isDropshipping = isDropshipping; }
    
    // ===== ADVANCED SEARCH GETTERS AND SETTERS =====
    
    public String getProductCondition() { return productCondition; }
    public void setProductCondition(String productCondition) { this.productCondition = productCondition; }
    
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }
    
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    
    public Boolean getIsAuction() { return isAuction; }
    public void setIsAuction(Boolean isAuction) { this.isAuction = isAuction; }
    
    public LocalDateTime getAuctionEndTime() { return auctionEndTime; }
    public void setAuctionEndTime(LocalDateTime auctionEndTime) { this.auctionEndTime = auctionEndTime; }
    
    public BigDecimal getStartingBid() { return startingBid; }
    public void setStartingBid(BigDecimal startingBid) { this.startingBid = startingBid; }
    
    public BigDecimal getCurrentBid() { return currentBid; }
    public void setCurrentBid(BigDecimal currentBid) { this.currentBid = currentBid; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isLive == null) {
            isLive = false;
        }
        if (viewerCount == null) {
            viewerCount = 0;
        }
        if (commissionRate == null) {
            commissionRate = new BigDecimal("5.00");
        }
        if (amazonListed == null) {
            amazonListed = false;
        }
        if (walmartListed == null) {
            walmartListed = false;
        }
        if (ebayListed == null) {
            ebayListed = false;
        }
        if (tiktokListed == null) {
            tiktokListed = false;
        }
        if (googleListed == null) {
            googleListed = false;
        }
        if (etsyListed == null) {
            etsyListed = false;
        }
        if (isDropshipping == null) {
            isDropshipping = false;
        }
        if (isAuction == null) {
            isAuction = false;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}