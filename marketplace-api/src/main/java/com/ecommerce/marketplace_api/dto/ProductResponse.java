package com.ecommerce.marketplace_api.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    // ===== BASIC FIELDS =====
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private BigDecimal compareAtPrice;
    private Integer quantity;
    private String sku;
    private Long categoryId;
    private String categoryName;
    private Long sellerId;
    private String storeName;
    private String images;
    private String specifications;
    private String status;
    private Integer viewsCount;
    private Integer salesCount;
    private BigDecimal rating;
    private LocalDateTime createdAt;
    
    // ===== LIVE STREAMING FIELDS =====
    private Boolean isLive;
    private BigDecimal livePrice;
    private LocalDateTime liveStartTime;
    private LocalDateTime liveEndTime;
    private Integer viewerCount;
    
    // ===== SEARCH FIELDS =====
    private String productCondition;
    private String brand;
    private String model;
    private String color;
    private Double weight;
    private String dimensions;
    private Boolean isAuction;
    private LocalDateTime auctionEndTime;
    private BigDecimal startingBid;
    private BigDecimal currentBid;
    
    public ProductResponse() {}
    
    // ===== BASIC GETTERS AND SETTERS =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    
    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Integer getViewsCount() { return viewsCount; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }
    
    public Integer getSalesCount() { return salesCount; }
    public void setSalesCount(Integer salesCount) { this.salesCount = salesCount; }
    
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
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
    
    // ===== SEARCH FIELDS GETTERS AND SETTERS =====
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
}