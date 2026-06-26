package com.ecommerce.marketplace_api.dto;

import java.math.BigDecimal;

public class VariationRequest {
    private String variationType;
    private String variationValue;
    private String sku;
    private BigDecimal priceAdjustment;
    private Integer quantity;
    private String imageUrl;
    private Boolean isActive;

    public VariationRequest() {}

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
}