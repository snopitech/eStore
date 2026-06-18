package com.ecommerce.marketplace_api.dto;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Long reviewerId;
    private String reviewerName;
    private Integer rating;
    private String title;
    private String comment;
    private String images;
    private Boolean verifiedPurchase;
    private String status;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
    
    // Constructors
    public ReviewResponse() {}
    
    public ReviewResponse(Long id, Long productId, String productName, Long reviewerId, String reviewerName,
                          Integer rating, String title, String comment, String images,
                          Boolean verifiedPurchase, String status, Integer helpfulCount, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.rating = rating;
        this.title = title;
        this.comment = comment;
        this.images = images;
        this.verifiedPurchase = verifiedPurchase;
        this.status = status;
        this.helpfulCount = helpfulCount;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    
    public Long getReviewerId() { return reviewerId; }
    public void setReviewerId(Long reviewerId) { this.reviewerId = reviewerId; }
    
    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    
    public Boolean getVerifiedPurchase() { return verifiedPurchase; }
    public void setVerifiedPurchase(Boolean verifiedPurchase) { this.verifiedPurchase = verifiedPurchase; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Integer getHelpfulCount() { return helpfulCount; }
    public void setHelpfulCount(Integer helpfulCount) { this.helpfulCount = helpfulCount; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}