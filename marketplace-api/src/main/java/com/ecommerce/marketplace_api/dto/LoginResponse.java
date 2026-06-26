package com.ecommerce.marketplace_api.dto;

public class LoginResponse {
    private String token;
    private String email;
    private String userType;
    private String firstName;
    private String lastName;

    // Default constructor
    public LoginResponse() {}

    // Constructor without firstName/lastName (for backward compatibility)
    public LoginResponse(String token, String email, String userType) {
        this.token = token;
        this.email = email;
        this.userType = userType;
        this.firstName = "";
        this.lastName = "";
    }

    // Full constructor with firstName and lastName
    public LoginResponse(String token, String email, String userType, String firstName, String lastName) {
        this.token = token;
        this.email = email;
        this.userType = userType;
        this.firstName = firstName != null ? firstName : "";
        this.lastName = lastName != null ? lastName : "";
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}