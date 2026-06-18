package com.ecommerce.marketplace_api.dto;

public class ReviewRequest {
    private Long productId;
    private Long orderItemId;
    private Integer rating;
    private String title;
    private String comment;
    private String images;
    
    // Getters and Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
}