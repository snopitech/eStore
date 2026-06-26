package com.ecommerce.marketplace_api.dto;

public class MessageRequest {
    private Long productId;
    private Long sellerId;
    private String subject;
    private String message;
    private String buyerEmail;
    private String buyerName;
    private String productName;

    public MessageRequest() {}

    public MessageRequest(Long productId, Long sellerId, String subject, String message, 
                          String buyerEmail, String buyerName, String productName) {
        this.productId = productId;
        this.sellerId = sellerId;
        this.subject = subject;
        this.message = message;
        this.buyerEmail = buyerEmail;
        this.buyerName = buyerName;
        this.productName = productName;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
}