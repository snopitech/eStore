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
public class ShopifyMarketplaceService {

    @Value("${shopify.api.key:}")
    private String apiKey;

    @Value("${shopify.api.secret:}")
    private String apiSecret;

    @Value("${shopify.store.url:}")
    private String storeUrl;

    @Value("${shopify.api.url:https://api.shopify.com/v1}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final MarketplaceListingRepository marketplaceListingRepository;

    public ShopifyMarketplaceService(MarketplaceListingRepository marketplaceListingRepository) {
        this.marketplaceListingRepository = marketplaceListingRepository;
        this.restTemplate = new RestTemplate();
    }

    public boolean listProduct(Product product, MarketplaceListing listing) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                System.err.println("❌ Shopify API key not configured. Mock sync for product: " + product.getId());
                return mockSync(product, listing);
            }

            System.out.println("📤 Listing product to Shopify: " + product.getName());

            Map<String, Object> productData = new HashMap<>();
            productData.put("title", product.getName());
            productData.put("body_html", product.getDescription());
            productData.put("vendor", product.getBrand());
            productData.put("product_type", "General");
            productData.put("status", "active");

            // Variant data
            Map<String, Object> variant = new HashMap<>();
            variant.put("price", product.getPrice());
            variant.put("sku", product.getSku());
            variant.put("inventory_quantity", product.getQuantity());
            variant.put("inventory_management", "shopify");

            productData.put("variants", new Object[]{variant});

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("product", productData);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Shopify-Access-Token", apiKey);
            headers.set("Content-Type", "application/json");

            org.springframework.http.HttpEntity<Map<String, Object>> entity = 
                new org.springframework.http.HttpEntity<>(requestBody, headers);

            String url = apiUrl + "/products.json";
            @SuppressWarnings("rawtypes")
            org.springframework.http.ResponseEntity<Map> response = 
                restTemplate.exchange(url, 
                    org.springframework.http.HttpMethod.POST, 
                    entity, 
                    Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null && responseBody.containsKey("product")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> productResponse = (Map<String, Object>) responseBody.get("product");
                    String productId = productResponse.get("id").toString();
                    listing.setMarketplaceProductId(productId);
                    listing.setSyncStatus("SYNCED");
                    listing.setLastSyncAt(LocalDateTime.now());
                    marketplaceListingRepository.save(listing);
                    System.out.println("✅ Product listed to Shopify successfully. ID: " + productId);
                    return true;
                }
            }

            listing.setSyncStatus("FAILED");
            listing.setSyncError("API call failed");
            marketplaceListingRepository.save(listing);
            return false;

        } catch (Exception e) {
            System.err.println("❌ Shopify sync error: " + e.getMessage());
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
            headers.set("X-Shopify-Access-Token", apiKey);

            org.springframework.http.HttpEntity<Void> entity = 
                new org.springframework.http.HttpEntity<>(headers);

            String url = apiUrl + "/products/" + marketplaceProductId + ".json";
            restTemplate.exchange(url, 
                org.springframework.http.HttpMethod.DELETE, 
                entity, 
                Void.class);

            System.out.println("✅ Product unlisted from Shopify");
            return true;

        } catch (Exception e) {
            System.err.println("❌ Shopify unlist error: " + e.getMessage());
            return false;
        }
    }

    public boolean updateInventory(Product product, MarketplaceListing listing) {
        try {
            if (apiKey == null || apiKey.isEmpty()) {
                return false;
            }

            String marketplaceProductId = listing.getMarketplaceProductId();
            if (marketplaceProductId == null || marketplaceProductId.isEmpty()) {
                return false;
            }

            System.out.println("📤 Updating inventory on Shopify: " + product.getName() + " -> " + product.getQuantity());

            // First get the product to find variant ID
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-Shopify-Access-Token", apiKey);

            org.springframework.http.HttpEntity<Void> entity = 
                new org.springframework.http.HttpEntity<>(headers);

            String getUrl = apiUrl + "/products/" + marketplaceProductId + ".json";
            @SuppressWarnings("rawtypes")
            org.springframework.http.ResponseEntity<Map> getResponse = 
                restTemplate.exchange(getUrl, 
                    org.springframework.http.HttpMethod.GET, 
                    entity, 
                    Map.class);

            if (getResponse.getStatusCode().is2xxSuccessful()) {
                @SuppressWarnings("unchecked")
                Map<String, Object> responseBody = getResponse.getBody();
                if (responseBody != null && responseBody.containsKey("product")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> productResponse = (Map<String, Object>) responseBody.get("product");
                    Object variants = productResponse.get("variants");
                    if (variants instanceof Object[]) {
                        Object[] variantArray = (Object[]) variants;
                        if (variantArray.length > 0) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> variant = (Map<String, Object>) variantArray[0];
                            String variantId = variant.get("id").toString();

                            // Update inventory
                            Map<String, Object> inventoryData = new HashMap<>();
                            inventoryData.put("inventory_quantity", product.getQuantity());

                            Map<String, Object> variantUpdate = new HashMap<>();
                            variantUpdate.put("id", Long.parseLong(variantId));
                            variantUpdate.put("inventory_quantity", product.getQuantity());

                            Map<String, Object> updateBody = new HashMap<>();
                            updateBody.put("variant", variantUpdate);

                            org.springframework.http.HttpEntity<Map<String, Object>> updateEntity = 
                                new org.springframework.http.HttpEntity<>(updateBody, headers);

                            String updateUrl = apiUrl + "/variants/" + variantId + ".json";
                            restTemplate.exchange(updateUrl, 
                                org.springframework.http.HttpMethod.PUT, 
                                updateEntity, 
                                Map.class);

                            System.out.println("✅ Inventory updated on Shopify");
                            return true;
                        }
                    }
                }
            }

            return false;

        } catch (Exception e) {
            System.err.println("❌ Shopify inventory update error: " + e.getMessage());
            return false;
        }
    }

    private boolean mockSync(Product product, MarketplaceListing listing) {
        System.out.println("📦 MOCK: Product listed to Shopify: " + product.getName());
        listing.setMarketplaceProductId("MOCK-" + product.getId() + "-" + System.currentTimeMillis());
        listing.setSyncStatus("SYNCED");
        listing.setLastSyncAt(LocalDateTime.now());
        marketplaceListingRepository.save(listing);
        return true;
    }
}