package com.ecommerce.marketplace_api.dto;

public class MessageResponse {
    private boolean success;
    private String message;
    private String data;

    public MessageResponse() {}

    public MessageResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public MessageResponse(boolean success, String message, String data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getData() { return data; }
    public void setData(String data) { this.data = data; }
}