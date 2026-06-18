package com.ecommerce.marketplace_api.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String userType;
    
    public LoginResponse(String token, String email, String userType) {
        this.token = token;
        this.email = email;
        this.userType = userType;
    }
    
    // Getters
    public String getToken() {
        return token;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getUserType() {
        return userType;
    }
    
    // Setters
    public void setToken(String token) {
        this.token = token;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public void setUserType(String userType) {
        this.userType = userType;
    }
}
