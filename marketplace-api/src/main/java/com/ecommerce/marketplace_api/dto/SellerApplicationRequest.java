package com.ecommerce.marketplace_api.dto;

public class SellerApplicationRequest {
    private String phoneNumber;
    private String address;
    private String goodsToSell;
    private String businessName;
    private String businessAddress;
    
    // Getters and Setters
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public String getGoodsToSell() { return goodsToSell; }
    public void setGoodsToSell(String goodsToSell) { this.goodsToSell = goodsToSell; }
    
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    
    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }
}