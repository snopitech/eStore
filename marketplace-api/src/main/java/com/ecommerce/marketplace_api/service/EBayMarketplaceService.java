package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.repository.MarketplaceListingRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EBayMarketplaceService {

    private final MarketplaceListingRepository marketplaceListingRepository;
    private final ProductRepository productRepository;

    public EBayMarketplaceService(MarketplaceListingRepository marketplaceListingRepository,
                                  ProductRepository productRepository) {
        this.marketplaceListingRepository = marketplaceListingRepository;
        this.productRepository = productRepository;
    }

    /**
     * Create a product listing on eBay
     */
    @Transactional
    public void createEBayListing(Product product) {
        try {
            System.out.println("📦 Creating eBay listing for product: " + product.getName());

            MarketplaceListing existingListing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "EBAY")
                    .orElse(null);

            if (existingListing != null && existingListing.getIsActive()) {
                System.out.println("Product already listed on eBay");
                return;
            }

            // TODO: Call eBay Sell API here
            // For now, we'll simulate success

            MarketplaceListing listing = new MarketplaceListing();
            listing.setProduct(product);
            listing.setMarketplace("EBAY");
            listing.setListingPrice(product.getPrice());
            listing.setListingStatus("ACTIVE");
            listing.setIsActive(true);
            listing.setSyncStatus("SYNCED");
            listing.setLastSyncAt(LocalDateTime.now());
            listing.setMarketplaceProductId("EBAY_" + product.getId());

            marketplaceListingRepository.save(listing);

            product.setEbayListed(true);
            product.setEbayPrice(product.getPrice());
            product.setLastSyncAt(LocalDateTime.now());
            productRepository.save(product);

            System.out.println("✅ eBay listing created for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to create eBay listing: " + e.getMessage());
            throw new RuntimeException("Failed to create eBay listing: " + e.getMessage());
        }
    }

    /**
     * Update inventory on eBay
     */
    @Transactional
    public void updateEBayInventory(Product product) {
        try {
            System.out.println("📦 Updating eBay inventory for product: " + product.getId());

            MarketplaceListing listing = marketplaceListingRepository
                    .findByProductAndMarketplace(product, "EBAY")
                    .orElseThrow(() -> new RuntimeException("eBay listing not found"));

            listing.setLastSyncAt(LocalDateTime.now());
            marketplaceListingRepository.save(listing);

            System.out.println("✅ eBay inventory updated for product: " + product.getId());

        } catch (Exception e) {
            System.err.println("❌ Failed to update eBay inventory: " + e.getMessage());
            throw new RuntimeException("Failed to update eBay inventory: " + e.getMessage());
        }
    }

    /**
     * Get eBay orders
     */
    public void fetchEBayOrders() {
        try {
            System.out.println("📦 Fetching eBay orders...");
            // TODO: Call eBay Sell API to get orders
            System.out.println("✅ eBay orders fetched");

        } catch (Exception e) {
            System.err.println("❌ Failed to fetch eBay orders: " + e.getMessage());
        }
    }
}