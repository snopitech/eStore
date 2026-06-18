package com.ecommerce.marketplace_api.dto;

public class AuthResponse {
    private String message;
    private Long userId;
    
    public AuthResponse(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }
    
    // Getters
    public String getMessage() {
        return message;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    // Setters
    public void setMessage(String message) {
        this.message = message;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}