package com.ecommerce.marketplace_api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VariationResponse {
    private Long id;
    private Long productId;
    private String variationType;
    private String variationValue;
    private String sku;
    private BigDecimal priceAdjustment;
    private Integer quantity;
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VariationResponse() {}

    // Constructor with all fields matching what you're passing
    public VariationResponse(Long id, Long productId, String variationType, String variationValue,
                             String sku, BigDecimal priceAdjustment, Integer quantity,
                             String imageUrl, Boolean isActive,
                             LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.productId = productId;
        this.variationType = variationType;
        this.variationValue = variationValue;
        this.sku = sku;
        this.priceAdjustment = priceAdjustment;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getVariationType() { return variationType; }
    public void setVariationType(String variationType) { this.variationType = variationType; }

    public String getVariationValue() { return variationValue; }
    public void setVariationValue(String variationValue) { this.variationValue = variationValue; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public BigDecimal getPriceAdjustment() { return priceAdjustment; }
    public void setPriceAdjustment(BigDecimal priceAdjustment) { this.priceAdjustment = priceAdjustment; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}