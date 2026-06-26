package com.ecommerce.marketplace_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WalmartConfig {

    @Value("${walmart.client.id:}")
    private String clientId;

    @Value("${walmart.client.secret:}")
    private String clientSecret;

    @Value("${walmart.seller.id:}")
    private String sellerId;

    @Value("${walmart.marketplace.id:}")
    private String marketplaceId;

    @Bean
    public String walmartClientId() {
        return clientId;
    }

    @Bean
    public String walmartClientSecret() {
        return clientSecret;
    }

    @Bean
    public String walmartSellerId() {
        return sellerId;
    }

    @Bean
    public String walmartMarketplaceId() {
        return marketplaceId != null ? marketplaceId : "US";
    }
}