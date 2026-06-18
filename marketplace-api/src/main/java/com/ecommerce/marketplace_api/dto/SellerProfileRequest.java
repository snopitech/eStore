package com.ecommerce.marketplace_api.dto;

public class SellerProfileRequest {
    private String storeName;
    private String storeSlug;
    private String storeDescription;
    private String storeLogoUrl;
    private String storeBannerUrl;
    
    // Getters and Setters
    public String getStoreName() {
        return storeName;
    }
    
    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }
    
    public String getStoreSlug() {
        return storeSlug;
    }
    
    public void setStoreSlug(String storeSlug) {
        this.storeSlug = storeSlug;
    }
    
    public String getStoreDescription() {
        return storeDescription;
    }
    
    public void setStoreDescription(String storeDescription) {
        this.storeDescription = storeDescription;
    }
    
    public String getStoreLogoUrl() {
        return storeLogoUrl;
    }
    
    public void setStoreLogoUrl(String storeLogoUrl) {
        this.storeLogoUrl = storeLogoUrl;
    }
    
    public String getStoreBannerUrl() {
        return storeBannerUrl;
    }
    
    public void setStoreBannerUrl(String storeBannerUrl) {
        this.storeBannerUrl = storeBannerUrl;
    }
}