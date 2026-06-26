package com.ecommerce.marketplace_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AmazonConfig {

    @Value("${amazon.client.id:}")
    private String clientId;

    @Value("${amazon.client.secret:}")
    private String clientSecret;

    @Value("${amazon.refresh.token:}")
    private String refreshToken;

    @Value("${amazon.aws.region:us-east-1}")
    private String awsRegion;

    @Value("${amazon.seller.id:}")
    private String sellerId;

    @Value("${amazon.marketplace.id:ATVPDKIKX0DER}")
    private String marketplaceId;

    @Bean
    public String amazonClientId() {
        return clientId;
    }

    @Bean
    public String amazonClientSecret() {
        return clientSecret;
    }

    @Bean
    public String amazonRefreshToken() {
        return refreshToken;
    }

    @Bean
    public String amazonAwsRegion() {
        return awsRegion;
    }

    @Bean
    public String amazonSellerId() {
        return sellerId;
    }

    @Bean
    public String amazonMarketplaceId() {
        return marketplaceId;
    }
}