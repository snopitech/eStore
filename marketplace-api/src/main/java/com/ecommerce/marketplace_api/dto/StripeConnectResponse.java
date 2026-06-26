package com.ecommerce.marketplace_api.dto;

public class StripeConnectResponse {
    private String accountId;
    private String accountLinkUrl;
    private String status;
    private String message;

    public StripeConnectResponse() {}

    public StripeConnectResponse(String accountId, String accountLinkUrl) {
        this.accountId = accountId;
        this.accountLinkUrl = accountLinkUrl;
        this.status = "PENDING";
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getAccountLinkUrl() {
        return accountLinkUrl;
    }

    public void setAccountLinkUrl(String accountLinkUrl) {
        this.accountLinkUrl = accountLinkUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}