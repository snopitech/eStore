package com.ecommerce.marketplace_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EBayConfig {

    @Value("${ebay.client.id:}")
    private String clientId;

    @Value("${ebay.client.secret:}")
    private String clientSecret;

    @Value("${ebay.refresh.token:}")
    private String refreshToken;

    @Value("${ebay.marketplace.id:EBAY_US}")
    private String marketplaceId;

    @Bean
    public String ebayClientId() {
        return clientId;
    }

    @Bean
    public String ebayClientSecret() {
        return clientSecret;
    }

    @Bean
    public String ebayRefreshToken() {
        return refreshToken;
    }

    @Bean
    public String ebayMarketplaceId() {
        return marketplaceId;
    }
}