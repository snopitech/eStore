package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.repository.MarketplaceListingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class BackmarketMarketplaceService {

    @Value("${backmarket.api.key:}")
    private String apiKey;

    @Value("${backmarket.api.url:https://api.backmarket.com/v1}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final MarketplaceListingRepository marketplaceListingRepository;

    public BackmarketMarketplaceService(MarketplaceListingRepository marketplaceListingRepository) {
        this.marketplaceListingRepository = marketplaceListingRepository;
        this.restTemplate = new RestTemplate();
    }

    public boolean listProduct(Product product, MarketplaceListing listing) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                System.err.println("❌ Backmarket API key not configured. Mock sync for product: " + product.getId());
                return mockSync(product, listing);
            }

            System.out.println("📤 Listing product to Backmarket: " + product.getName());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("name", product.getName());
            requestBody.put("description", product.getDescription());
            requestBody.put("price", product.getPrice());
            requestBody.put("quantity", product.getQuantity());
            requestBody.put("sku", product.getSku());

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("Content-Type", "application/json");

            org.springframework.http.HttpEntity<Map<String, Object>> entity = 
                new org.springframework.http.HttpEntity<>(requestBody, headers);

            String url = apiUrl + "/products";
            @SuppressWarnings("rawtypes")
            org.springframework.http.ResponseEntity<Map> response = 
                restTemplate.exchange(url, 
                    org.springframework.http.HttpMethod.POST, 
                    entity, 
                    Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("id")) {
                    listing.setMarketplaceProductId(responseBody.get("id").toString());
                    listing.setSyncStatus("SYNCED");
                    listing.setLastSyncAt(LocalDateTime.now());
                    marketplaceListingRepository.save(listing);
                    System.out.println("✅ Product listed to Backmarket successfully");
                    return true;
                }
            }

            listing.setSyncStatus("FAILED");
            listing.setSyncError("API call failed");
            marketplaceListingRepository.save(listing);
            return false;

        } catch (Exception e) {
            System.err.println("❌ Backmarket sync error: " + e.getMessage());
            listing.setSyncStatus("FAILED");
            listing.setSyncError(e.getMessage());
            marketplaceListingRepository.save(listing);
            return false;
        }
    }

    public boolean unlistProduct(Product product, MarketplaceListing listing) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return false;
            }

            String marketplaceProductId = listing.getMarketplaceProductId();
            if (marketplaceProductId == null || marketplaceProductId.isEmpty()) {
                return false;
            }

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);

            org.springframework.http.HttpEntity<Void> entity = 
                new org.springframework.http.HttpEntity<>(headers);

            String url = apiUrl + "/products/" + marketplaceProductId;
            restTemplate.exchange(url, 
                org.springframework.http.HttpMethod.DELETE, 
                entity, 
                Void.class);

            System.out.println("✅ Product unlisted from Backmarket");
            return true;

        } catch (Exception e) {
            System.err.println("❌ Backmarket unlist error: " + e.getMessage());
            return false;
        }
    }

    private boolean mockSync(Product product, MarketplaceListing listing) {
        System.out.println("📦 MOCK: Product listed to Backmarket: " + product.getName());
        listing.setMarketplaceProductId("MOCK-" + product.getId() + "-" + System.currentTimeMillis());
        listing.setSyncStatus("SYNCED");
        listing.setLastSyncAt(LocalDateTime.now());
        marketplaceListingRepository.save(listing);
        return true;
    }
}