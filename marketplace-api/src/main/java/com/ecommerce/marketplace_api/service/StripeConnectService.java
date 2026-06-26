package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.StripeConnectResponse;
import com.ecommerce.marketplace_api.model.SellerProfile;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import com.stripe.Stripe;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.model.PaymentIntent;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeConnectService {

    private final SellerProfileRepository sellerProfileRepository;

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${stripe.connect.client.id:}")
    private String connectClientId;

    @Value("${stripe.connect.redirect.uri:}")
    private String redirectUri;

    public StripeConnectService(SellerProfileRepository sellerProfileRepository) {
        this.sellerProfileRepository = sellerProfileRepository;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        System.out.println("✅ Stripe API key initialized for Connect");
    }

    /**
     * Create a Stripe Connect account for a seller
     */
    public StripeConnectResponse createConnectAccount(User user, String businessName, String phone) {
        try {
            System.out.println("📦 Creating Stripe Connect account for: " + user.getEmail());

            AccountCreateParams params = AccountCreateParams.builder()
                    .setType(AccountCreateParams.Type.EXPRESS)
                    .setCountry("US")
                    .setEmail(user.getEmail())
                    .setBusinessType(AccountCreateParams.BusinessType.INDIVIDUAL)
                    .setBusinessProfile(
                        AccountCreateParams.BusinessProfile.builder()
                            .setName(businessName != null ? businessName : user.getFirstName() + "'s Store")
                            .build()
                    )
                    .build();

            Account account = Account.create(params);

            System.out.println("✅ Stripe Connect account created: " + account.getId());

            SellerProfile sellerProfile = sellerProfileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Seller profile not found"));

            sellerProfile.setStripeConnectAccountId(account.getId());
            sellerProfile.setStripeConnectStatus("PENDING");
            sellerProfileRepository.save(sellerProfile);

            AccountLinkCreateParams linkParams = AccountLinkCreateParams.builder()
                    .setAccount(account.getId())
                    .setRefreshUrl(redirectUri + "?status=refresh")
                    .setReturnUrl(redirectUri + "?status=success")
                    .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                    .build();

            AccountLink accountLink = AccountLink.create(linkParams);

            return new StripeConnectResponse(account.getId(), accountLink.getUrl());

        } catch (Exception e) {
            System.err.println("❌ Failed to create Stripe Connect account: " + e.getMessage());
            throw new RuntimeException("Failed to create Stripe Connect account: " + e.getMessage());
        }
    }

    /**
     * Get Stripe Connect account status
     */
    public Map<String, Object> getAccountStatus(SellerProfile sellerProfile) {
        try {
            if (sellerProfile.getStripeConnectAccountId() == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "NOT_SETUP");
                response.put("message", "Please connect your Stripe account");
                return response;
            }

            Account account = Account.retrieve(sellerProfile.getStripeConnectAccountId());

            Map<String, Object> response = new HashMap<>();
            response.put("status", sellerProfile.getStripeConnectStatus());
            response.put("verified", sellerProfile.getStripeConnectVerified());
            response.put("accountId", account.getId());
            response.put("chargesEnabled", account.getChargesEnabled());
            response.put("payoutsEnabled", account.getPayoutsEnabled());

            return response;

        } catch (Exception e) {
            System.err.println("❌ Failed to get account status: " + e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
            return response;
        }
    }

    /**
     * Create a payment intent with automatic split
     * 5% goes to platform (you), 95% goes to seller
     */
    @SuppressWarnings("unused")
    public PaymentIntent createSplitPaymentIntent(BigDecimal totalAmount, String sellerStripeAccountId) {
        try {
            long amountInCents = totalAmount.multiply(new BigDecimal("100")).longValue();

            BigDecimal commission = totalAmount.multiply(new BigDecimal("0.05"));
            BigDecimal sellerAmount = totalAmount.multiply(new BigDecimal("0.95"));

            long commissionInCents = commission.multiply(new BigDecimal("100")).longValue();
            long sellerAmountInCents = sellerAmount.multiply(new BigDecimal("100")).longValue();

            System.out.println("💰 Creating split payment:");
            System.out.println("  Total: $" + totalAmount);
            System.out.println("  Commission (5%): $" + commission);
            System.out.println("  Seller gets (95%): $" + sellerAmount);

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .putMetadata("commission", commission.toString())
                    .putMetadata("sellerAmount", sellerAmount.toString())
                    .setApplicationFeeAmount(commissionInCents)
                    .setTransferData(
                        PaymentIntentCreateParams.TransferData.builder()
                            .setDestination(sellerStripeAccountId)
                            .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            System.out.println("✅ Split payment intent created: " + paymentIntent.getId());

            return paymentIntent;

        } catch (Exception e) {
            System.err.println("❌ Failed to create split payment: " + e.getMessage());
            throw new RuntimeException("Failed to create split payment: " + e.getMessage());
        }
    }
}