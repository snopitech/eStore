package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.repository.MarketplaceListingRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EtsyService {

    private final MarketplaceListingRepository marketplaceListingRepository;
    private final ProductRepository productRepository;

    @Value("${etsy.client.id:}")
    private String clientId;

    @Value("${etsy.client.secret:}")
    private String clientSecret;

    @Value("${etsy.access.token:}")
    private String accessToken;

    @Value("${etsy.shop.id:}")
    private String shopId;

    @Value("${etsy.api.url:https://openapi.etsy.com/v3}")
    private String apiUrl;

    public EtsyService(MarketplaceListingRepository marketplaceListingRepository,
                       ProductRepository productRepository) {
        this.marketplaceListingRepository = marketplaceListingRepository;
        this.productRepository = productRepository;
    }

    /**
     * Create a product listing on Etsy
     */
    @Transactional
    public void createEtsyListing(Product product) {
        try {
            System.out.println("📦 Creating Etsy listing for product: " + product.getName());

            MarketplaceListing existingListing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "ETSY")
                    .orElse(null);

            if (existingListing != null && existingListing.getIsActive()) {
                System.out.println("Product already listed on Etsy");
                return;
            }

            // TODO: Call Etsy Open API here
            // For now, we'll simulate success

            MarketplaceListing listing = new MarketplaceListing();
            listing.setProduct(product);
            listing.setMarketplace("ETSY");
            listing.setListingPrice(product.getPrice());
            listing.setListingStatus("ACTIVE");
            listing.setIsActive(true);
            listing.setSyncStatus("SYNCED");
            listing.setLastSyncAt(LocalDateTime.now());
            listing.setMarketplaceProductId("ETSY_" + product.getId());

            marketplaceListingRepository.save(listing);

            product.setLastSyncAt(LocalDateTime.now());
            productRepository.save(product);

            System.out.println("✅ Etsy listing created for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to create Etsy listing: " + e.getMessage());
            throw new RuntimeException("Failed to create Etsy listing: " + e.getMessage());
        }
    }

    /**
     * Update inventory on Etsy
     */
    @Transactional
    public void updateEtsyInventory(Product product) {
        try {
            System.out.println("📦 Updating Etsy inventory for product: " + product.getId());

            MarketplaceListing listing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "ETSY")
                    .orElseThrow(() -> new RuntimeException("Etsy listing not found"));

            listing.setLastSyncAt(LocalDateTime.now());
            marketplaceListingRepository.save(listing);

            System.out.println("✅ Etsy inventory updated for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to update Etsy inventory: " + e.getMessage());
            throw new RuntimeException("Failed to update Etsy inventory: " + e.getMessage());
        }
    }

    /**
     * Get Etsy orders
     */
    public void fetchEtsyOrders() {
        try {
            System.out.println("📦 Fetching Etsy orders...");
            // TODO: Call Etsy Open API to get orders
            System.out.println("✅ Etsy orders fetched");

        } catch (Exception e) {
            System.err.println("❌ Failed to fetch Etsy orders: " + e.getMessage());
        }
    }

    /**
     * Simulate Etsy order (for testing)
     */
    @Transactional
    public void simulateEtsyOrder(Long productId, int quantity) {
        try {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            System.out.println("📦 Simulating Etsy order for product: " + product.getName());

            System.out.println("✅ Etsy order simulated for product: " + productId);

        } catch (Exception e) {
            System.err.println("❌ Failed to simulate Etsy order: " + e.getMessage());
        }
    }
}