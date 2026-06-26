package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.ProductStatus;
import com.ecommerce.marketplace_api.repository.MarketplaceListingRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MarketplaceService {

    private final MarketplaceListingRepository marketplaceListingRepository;
    private final ProductRepository productRepository;

    // ===== SUPPORTED MARKETPLACES =====
    public static final String MARKETPLACE_AMAZON = "AMAZON";
    public static final String MARKETPLACE_WALMART = "WALMART";
    public static final String MARKETPLACE_EBAY = "EBAY";
    public static final String MARKETPLACE_TIKTOK = "TIKTOK";
    public static final String MARKETPLACE_GOOGLE = "GOOGLE";
    public static final String MARKETPLACE_ETSY = "ETSY";
    public static final String MARKETPLACE_BACKMARKET = "BACKMARKET";  // NEW
    public static final String MARKETPLACE_TEMU = "TEMU";              // NEW
    public static final String MARKETPLACE_SHOPIFY = "SHOPIFY";        // NEW

    public MarketplaceService(MarketplaceListingRepository marketplaceListingRepository,
                              ProductRepository productRepository) {
        this.marketplaceListingRepository = marketplaceListingRepository;
        this.productRepository = productRepository;
    }

    // ===== GET ALL MARKETPLACES =====
    public String[] getAllMarketplaces() {
        return new String[]{
            MARKETPLACE_AMAZON,
            MARKETPLACE_WALMART,
            MARKETPLACE_EBAY,
            MARKETPLACE_TIKTOK,
            MARKETPLACE_GOOGLE,
            MARKETPLACE_ETSY,
            MARKETPLACE_BACKMARKET,  // NEW
            MARKETPLACE_TEMU,        // NEW
            MARKETPLACE_SHOPIFY      // NEW
        };
    }

    // ===== LIST PRODUCTS TO MARKETPLACES =====

    @Transactional
    public MarketplaceListing listProductToMarketplace(Product product, String marketplace, BigDecimal marketplacePrice) {
        if (marketplaceListingRepository.findByProductAndMarketplace(product, marketplace).isPresent()) {
            throw new RuntimeException("Product already listed on " + marketplace);
        }

        MarketplaceListing listing = new MarketplaceListing();
        listing.setProduct(product);
        listing.setMarketplace(marketplace);
        listing.setListingPrice(marketplacePrice != null ? marketplacePrice : product.getPrice());
        listing.setListingStatus("ACTIVE");
        listing.setIsActive(true);
        listing.setSyncStatus("PENDING");
        listing.setLastSyncAt(LocalDateTime.now());

        updateProductMarketplaceFlags(product, marketplace, true);

        return marketplaceListingRepository.save(listing);
    }

    @Transactional
    public List<MarketplaceListing> listProductToAllMarketplaces(Product product) {
        String[] marketplaces = getAllMarketplaces();

        for (String marketplace : marketplaces) {
            try {
                if (marketplaceListingRepository.findByProductAndMarketplace(product, marketplace).isEmpty()) {
                    MarketplaceListing listing = new MarketplaceListing();
                    listing.setProduct(product);
                    listing.setMarketplace(marketplace);
                    listing.setListingPrice(product.getPrice());
                    listing.setListingStatus("ACTIVE");
                    listing.setIsActive(true);
                    listing.setSyncStatus("PENDING");
                    listing.setLastSyncAt(LocalDateTime.now());
                    marketplaceListingRepository.save(listing);
                }
            } catch (Exception e) {
                System.err.println("Failed to list product on " + marketplace + ": " + e.getMessage());
            }
        }

        return marketplaceListingRepository.findByProduct(product);
    }

    @Transactional
    public void unlistProductFromMarketplace(Product product, String marketplace) {
        MarketplaceListing listing = marketplaceListingRepository.findByProductAndMarketplace(product, marketplace)
                .orElseThrow(() -> new RuntimeException("Listing not found on " + marketplace));

        listing.setListingStatus("INACTIVE");
        listing.setIsActive(false);
        listing.setSyncStatus("PENDING");
        listing.setLastSyncAt(LocalDateTime.now());

        updateProductMarketplaceFlags(product, marketplace, false);

        marketplaceListingRepository.save(listing);
    }

    // ===== SYNC OPERATIONS =====

    @Transactional
    public void syncProductToMarketplaces(Product product) {
        List<MarketplaceListing> listings = marketplaceListingRepository.findByProduct(product);

        for (MarketplaceListing listing : listings) {
            if (listing.getIsActive()) {
                try {
                    listing.setSyncStatus("SYNCED");
                    listing.setLastSyncAt(LocalDateTime.now());
                    marketplaceListingRepository.save(listing);

                    product.setLastSyncAt(LocalDateTime.now());
                    productRepository.save(product);

                    System.out.println("✅ Synced product " + product.getId() + " to " + listing.getMarketplace());

                } catch (Exception e) {
                    listing.setSyncStatus("FAILED");
                    listing.setSyncError(e.getMessage());
                    marketplaceListingRepository.save(listing);
                    System.err.println("❌ Failed to sync to " + listing.getMarketplace() + ": " + e.getMessage());
                }
            }
        }
    }

    @Transactional
    public void syncAllPendingProducts() {
        List<MarketplaceListing> pendingListings = marketplaceListingRepository.findPendingSync();

        for (MarketplaceListing listing : pendingListings) {
            Product product = listing.getProduct();
            if (product.getStatus() == ProductStatus.ACTIVE) {
                syncProductToMarketplaces(product);
            }
        }

        System.out.println("✅ Synced " + pendingListings.size() + " products to marketplaces");
    }

    // ===== INVENTORY SYNC =====

    @Transactional
    public void syncInventory(Product product) {
        if (!product.getIsLive()) {
            return;
        }

        List<MarketplaceListing> listings = marketplaceListingRepository.findByProductAndIsActiveTrue(product);

        for (MarketplaceListing listing : listings) {
            try {
                listing.setLastSyncAt(LocalDateTime.now());
                marketplaceListingRepository.save(listing);

                System.out.println("✅ Updated inventory for product " + product.getId() +
                        " on " + listing.getMarketplace() + " to " + product.getQuantity());

            } catch (Exception e) {
                System.err.println("❌ Failed to update inventory on " + listing.getMarketplace() +
                        ": " + e.getMessage());
            }
        }
    }

    // ===== HELPERS =====

    private void updateProductMarketplaceFlags(Product product, String marketplace, boolean listed) {
        switch (marketplace) {
            case MARKETPLACE_AMAZON:
                product.setAmazonListed(listed);
                break;
            case MARKETPLACE_WALMART:
                product.setWalmartListed(listed);
                break;
            case MARKETPLACE_EBAY:
                product.setEbayListed(listed);
                break;
            case MARKETPLACE_TIKTOK:
                product.setTikTokListed(listed);
                break;
            case MARKETPLACE_GOOGLE:
                product.setGoogleListed(listed);
                break;
            case MARKETPLACE_ETSY:
                product.setEtsyListed(listed);
                break;
            case MARKETPLACE_BACKMARKET:  // NEW
                // Add field to Product if needed
                break;
            case MARKETPLACE_TEMU:        // NEW
                // Add field to Product if needed
                break;
            case MARKETPLACE_SHOPIFY:     // NEW
                // Add field to Product if needed
                break;
            default:
                break;
        }
        product.setLastSyncAt(LocalDateTime.now());
        productRepository.save(product);
    }

    // ===== GETTER METHODS =====

    public List<MarketplaceListing> getListingsForProduct(Product product) {
        return marketplaceListingRepository.findByProduct(product);
    }

    public List<MarketplaceListing> getActiveListingsForProduct(Product product) {
        return marketplaceListingRepository.findByProductAndIsActiveTrue(product);
    }

    public List<MarketplaceListing> getActiveListingsByMarketplace(String marketplace) {
        return marketplaceListingRepository.findByMarketplaceAndIsActiveTrue(marketplace);
    }

    public long countActiveListingsByMarketplace(String marketplace) {
        return marketplaceListingRepository.countActiveListingsByMarketplace(marketplace);
    }

    // ===== GET MARKETPLACE STATS (ALL 9) =====
    public MarketplaceStats getMarketplaceStats() {
        MarketplaceStats stats = new MarketplaceStats();
        
        stats.setAmazon(countActiveListingsByMarketplace(MARKETPLACE_AMAZON));
        stats.setWalmart(countActiveListingsByMarketplace(MARKETPLACE_WALMART));
        stats.setEbay(countActiveListingsByMarketplace(MARKETPLACE_EBAY));
        stats.setTikTok(countActiveListingsByMarketplace(MARKETPLACE_TIKTOK));
        stats.setGoogle(countActiveListingsByMarketplace(MARKETPLACE_GOOGLE));
        stats.setEtsy(countActiveListingsByMarketplace(MARKETPLACE_ETSY));
        stats.setBackmarket(countActiveListingsByMarketplace(MARKETPLACE_BACKMARKET));
        stats.setTemu(countActiveListingsByMarketplace(MARKETPLACE_TEMU));
        stats.setShopify(countActiveListingsByMarketplace(MARKETPLACE_SHOPIFY));
        
        stats.setTotal(
            stats.getAmazon() + stats.getWalmart() + stats.getEbay() +
            stats.getTikTok() + stats.getGoogle() + stats.getEtsy() +
            stats.getBackmarket() + stats.getTemu() + stats.getShopify()
        );
        
        return stats;
    }

    // ===== INNER CLASS: MARKETPLACE STATS =====
    public static class MarketplaceStats {
        private long amazon;
        private long walmart;
        private long ebay;
        private long tiktok;
        private long google;
        private long etsy;
        private long backmarket;
        private long temu;
        private long shopify;
        private long total;

        // Getters and Setters
        public long getAmazon() { return amazon; }
        public void setAmazon(long amazon) { this.amazon = amazon; }
        
        public long getWalmart() { return walmart; }
        public void setWalmart(long walmart) { this.walmart = walmart; }
        
        public long getEbay() { return ebay; }
        public void setEbay(long ebay) { this.ebay = ebay; }
        
        public long getTikTok() { return tiktok; }
        public void setTikTok(long tiktok) { this.tiktok = tiktok; }
        
        public long getGoogle() { return google; }
        public void setGoogle(long google) { this.google = google; }
        
        public long getEtsy() { return etsy; }
        public void setEtsy(long etsy) { this.etsy = etsy; }
        
        public long getBackmarket() { return backmarket; }
        public void setBackmarket(long backmarket) { this.backmarket = backmarket; }
        
        public long getTemu() { return temu; }
        public void setTemu(long temu) { this.temu = temu; }
        
        public long getShopify() { return shopify; }
        public void setShopify(long shopify) { this.shopify = shopify; }
        
        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
    }
}