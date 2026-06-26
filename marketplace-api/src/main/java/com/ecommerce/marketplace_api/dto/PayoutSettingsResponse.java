package com.ecommerce.marketplace_api.dto;

public class PayoutSettingsResponse {
    private String payoutMethod;
    private String payoutAccountName;
    private String payoutAccountNumber;
    private String payoutRoutingNumber;
    private String payoutPaypalEmail;
    private String payoutEmail;

    public PayoutSettingsResponse() {}

    public PayoutSettingsResponse(String payoutMethod, String payoutAccountName, 
                                   String payoutAccountNumber, String payoutRoutingNumber,
                                   String payoutPaypalEmail, String payoutEmail) {
        this.payoutMethod = payoutMethod;
        this.payoutAccountName = payoutAccountName;
        this.payoutAccountNumber = payoutAccountNumber;
        this.payoutRoutingNumber = payoutRoutingNumber;
        this.payoutPaypalEmail = payoutPaypalEmail;
        this.payoutEmail = payoutEmail;
    }

    public String getPayoutMethod() {
        return payoutMethod;
    }

    public void setPayoutMethod(String payoutMethod) {
        this.payoutMethod = payoutMethod;
    }

    public String getPayoutAccountName() {
        return payoutAccountName;
    }

    public void setPayoutAccountName(String payoutAccountName) {
        this.payoutAccountName = payoutAccountName;
    }

    public String getPayoutAccountNumber() {
        return payoutAccountNumber;
    }

    public void setPayoutAccountNumber(String payoutAccountNumber) {
        this.payoutAccountNumber = payoutAccountNumber;
    }

    public String getPayoutRoutingNumber() {
        return payoutRoutingNumber;
    }

    public void setPayoutRoutingNumber(String payoutRoutingNumber) {
        this.payoutRoutingNumber = payoutRoutingNumber;
    }

    public String getPayoutPaypalEmail() {
        return payoutPaypalEmail;
    }

    public void setPayoutPaypalEmail(String payoutPaypalEmail) {
        this.payoutPaypalEmail = payoutPaypalEmail;
    }

    public String getPayoutEmail() {
        return payoutEmail;
    }

    public void setPayoutEmail(String payoutEmail) {
        this.payoutEmail = payoutEmail;
    }
}
