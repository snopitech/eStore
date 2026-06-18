package com.ecommerce.marketplace_api.dto;

import java.math.BigDecimal;

public class SellerProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String storeName;
    private String storeSlug;
    private String storeDescription;
    private String storeLogoUrl;
    private String storeBannerUrl;
    private BigDecimal rating;
    private Integer totalSales;
    private Integer totalProducts;
    
    // Constructors
    public SellerProfileResponse() {}
    
    public SellerProfileResponse(Long id, Long userId, String email, String storeName, 
                                 String storeSlug, String storeDescription, String storeLogoUrl,
                                 String storeBannerUrl, BigDecimal rating, Integer totalSales, 
                                 Integer totalProducts) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.storeName = storeName;
        this.storeSlug = storeSlug;
        this.storeDescription = storeDescription;
        this.storeLogoUrl = storeLogoUrl;
        this.storeBannerUrl = storeBannerUrl;
        this.rating = rating;
        this.totalSales = totalSales;
        this.totalProducts = totalProducts;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
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
}