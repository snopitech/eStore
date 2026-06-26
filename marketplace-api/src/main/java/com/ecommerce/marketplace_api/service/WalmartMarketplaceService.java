package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.repository.MarketplaceListingRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class WalmartMarketplaceService {

    private final MarketplaceListingRepository marketplaceListingRepository;
    private final ProductRepository productRepository;

    public WalmartMarketplaceService(MarketplaceListingRepository marketplaceListingRepository,
                                     ProductRepository productRepository) {
        this.marketplaceListingRepository = marketplaceListingRepository;
        this.productRepository = productRepository;
    }

    /**
     * Create a product listing on Walmart
     */
    @Transactional
    public void createWalmartListing(Product product) {
        try {
            System.out.println("📦 Creating Walmart listing for product: " + product.getName());

            MarketplaceListing existingListing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "WALMART")
                    .orElse(null);

            if (existingListing != null && existingListing.getIsActive()) {
                System.out.println("Product already listed on Walmart");
                return;
            }

            // TODO: Call Walmart Marketplace API here
            // For now, we'll simulate success

            MarketplaceListing listing = new MarketplaceListing();
            listing.setProduct(product);
            listing.setMarketplace("WALMART");
            listing.setListingPrice(product.getPrice());
            listing.setListingStatus("ACTIVE");
            listing.setIsActive(true);
            listing.setSyncStatus("SYNCED");
            listing.setLastSyncAt(LocalDateTime.now());
            listing.setMarketplaceProductId("WMT_" + product.getId());

            marketplaceListingRepository.save(listing);

            product.setWalmartListed(true);
            product.setWalmartPrice(product.getPrice());
            product.setLastSyncAt(LocalDateTime.now());
            productRepository.save(product);

            System.out.println("✅ Walmart listing created for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to create Walmart listing: " + e.getMessage());
            throw new RuntimeException("Failed to create Walmart listing: " + e.getMessage());
        }
    }

    /**
     * Update inventory on Walmart
     */
    @Transactional
    public void updateWalmartInventory(Product product) {
        try {
            System.out.println("📦 Updating Walmart inventory for product: " + product.getId());

            MarketplaceListing listing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "WALMART")
                    .orElseThrow(() -> new RuntimeException("Walmart listing not found"));

            listing.setLastSyncAt(LocalDateTime.now());
            marketplaceListingRepository.save(listing);

            System.out.println("✅ Walmart inventory updated for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to update Walmart inventory: " + e.getMessage());
            throw new RuntimeException("Failed to update Walmart inventory: " + e.getMessage());
        }
    }

    /**
     * Get Walmart orders
     */
    public void fetchWalmartOrders() {
        try {
            System.out.println("📦 Fetching Walmart orders...");
            // TODO: Call Walmart Marketplace API to get orders
            System.out.println("✅ Walmart orders fetched");

        } catch (Exception e) {
            System.err.println("❌ Failed to fetch Walmart orders: " + e.getMessage());
        }
    }
}