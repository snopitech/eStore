package com.ecommerce.marketplace_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TikTokConfig {

    @Value("${tiktok.client.id:}")
    private String clientId;

    @Value("${tiktok.client.secret:}")
    private String clientSecret;

    @Value("${tiktok.access.token:}")
    private String accessToken;

    @Value("${tiktok.shop.id:}")
    private String shopId;

    @Value("${tiktok.api.url:https://open.tiktokapis.com/v2}")
    private String apiUrl;

    @Bean
    public String tiktokClientId() {
        return clientId;
    }

    @Bean
    public String tiktokClientSecret() {
        return clientSecret;
    }

    @Bean
    public String tiktokAccessToken() {
        return accessToken;
    }

    @Bean
    public String tiktokShopId() {
        return shopId;
    }

    @Bean
    public String tiktokApiUrl() {
        return apiUrl;
    }
}