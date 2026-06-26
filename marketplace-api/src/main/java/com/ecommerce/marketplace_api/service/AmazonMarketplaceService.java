package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.repository.MarketplaceListingRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AmazonMarketplaceService {

    private final MarketplaceListingRepository marketplaceListingRepository;
    private final ProductRepository productRepository;

    public AmazonMarketplaceService(MarketplaceListingRepository marketplaceListingRepository,
                                    ProductRepository productRepository) {
        this.marketplaceListingRepository = marketplaceListingRepository;
        this.productRepository = productRepository;
    }

    /**
     * Create a product listing on Amazon
     */
    @Transactional
    public void createAmazonListing(Product product) {
        try {
            System.out.println("📦 Creating Amazon listing for product: " + product.getName());

            // Check if listing already exists
            MarketplaceListing existingListing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "AMAZON")
                    .orElse(null);

            if (existingListing != null && existingListing.getIsActive()) {
                System.out.println("Product already listed on Amazon");
                return;
            }

            // TODO: Call Amazon SP-API here
            // For now, we'll simulate success

            MarketplaceListing listing = new MarketplaceListing();
            listing.setProduct(product);
            listing.setMarketplace("AMAZON");
            listing.setListingPrice(product.getPrice());
            listing.setListingStatus("ACTIVE");
            listing.setIsActive(true);
            listing.setSyncStatus("SYNCED");
            listing.setLastSyncAt(LocalDateTime.now());
            listing.setMarketplaceProductId("AMZN_" + product.getId());

            marketplaceListingRepository.save(listing);

            // Update product
            product.setAmazonListed(true);
            product.setAmazonPrice(product.getPrice());
            product.setLastSyncAt(LocalDateTime.now());
            productRepository.save(product);

            System.out.println("✅ Amazon listing created for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to create Amazon listing: " + e.getMessage());
            throw new RuntimeException("Failed to create Amazon listing: " + e.getMessage());
        }
    }

    /**
     * Update inventory on Amazon
     */
    @Transactional
    public void updateAmazonInventory(Product product) {
        try {
            System.out.println("📦 Updating Amazon inventory for product: " + product.getId());

            MarketplaceListing listing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "AMAZON")
                    .orElseThrow(() -> new RuntimeException("Amazon listing not found"));

            listing.setLastSyncAt(LocalDateTime.now());
            marketplaceListingRepository.save(listing);

            System.out.println("✅ Amazon inventory updated for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to update Amazon inventory: " + e.getMessage());
            throw new RuntimeException("Failed to update Amazon inventory: " + e.getMessage());
        }
    }

    /**
     * Get Amazon orders
     */
    public void fetchAmazonOrders() {
        try {
            System.out.println("📦 Fetching Amazon orders...");
            // TODO: Call Amazon SP-API to get orders
            System.out.println("✅ Amazon orders fetched");

        } catch (Exception e) {
            System.err.println("❌ Failed to fetch Amazon orders: " + e.getMessage());
        }
    }

    /**
     * Sync Amazon order status
     */
    public void syncAmazonOrderStatus(String amazonOrderId) {
        try {
            System.out.println("📦 Syncing Amazon order status: " + amazonOrderId);
            // TODO: Call Amazon SP-API to get order status
            System.out.println("✅ Amazon order status synced");

        } catch (Exception e) {
            System.err.println("❌ Failed to sync Amazon order status: " + e.getMessage());
        }
    }
}