package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.MarketplaceService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MarketplaceController {

    private final MarketplaceService marketplaceService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public MarketplaceController(MarketplaceService marketplaceService,
                                 ProductRepository productRepository,
                                 UserRepository userRepository,
                                 JwtUtil jwtUtil) {
        this.marketplaceService = marketplaceService;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ===== HELPER METHODS =====

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private User getAuthenticatedAdmin(String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user.getUserType() != UserType.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
        return user;
    }

    // ===== ENDPOINTS =====

    /**
     * List a product to a marketplace
     * POST /api/marketplace/products/{productId}/list
     */
    @PostMapping("/products/{productId}/list")
    public ResponseEntity<?> listProductToMarketplace(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId,
            @RequestBody Map<String, Object> request) {

        try {
            @SuppressWarnings("unused")
            User user = getAuthenticatedAdmin(authHeader);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            String marketplace = (String) request.get("marketplace");
            BigDecimal price = request.containsKey("price") ?
                    new BigDecimal(request.get("price").toString()) : null;

            if (marketplace == null || marketplace.isEmpty()) {
                return ResponseEntity.badRequest().body("Marketplace is required");
            }

            MarketplaceListing listing = marketplaceService.listProductToMarketplace(product, marketplace, price);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product listed to " + marketplace + " successfully");
            response.put("listing", listing);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * List a product to all marketplaces (9 marketplaces)
     * POST /api/marketplace/products/{productId}/list-all
     */
    @PostMapping("/products/{productId}/list-all")
    public ResponseEntity<?> listProductToAllMarketplaces(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {

        try {
            @SuppressWarnings("unused")
            User user = getAuthenticatedAdmin(authHeader);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            List<MarketplaceListing> listings = marketplaceService.listProductToAllMarketplaces(product);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product listed to all 9 marketplaces successfully");
            response.put("listings", listings);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Unlist a product from a marketplace
     * POST /api/marketplace/products/{productId}/unlist
     */
    @PostMapping("/products/{productId}/unlist")
    public ResponseEntity<?> unlistProductFromMarketplace(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId,
            @RequestBody Map<String, String> request) {

        try {
            @SuppressWarnings("unused")
            User user = getAuthenticatedAdmin(authHeader);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            String marketplace = request.get("marketplace");

            if (marketplace == null || marketplace.isEmpty()) {
                return ResponseEntity.badRequest().body("Marketplace is required");
            }

            marketplaceService.unlistProductFromMarketplace(product, marketplace);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Product unlisted from " + marketplace + " successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Sync a product to all marketplaces
     * POST /api/marketplace/products/{productId}/sync
     */
    @PostMapping("/products/{productId}/sync")
    public ResponseEntity<?> syncProduct(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {

        try {
            @SuppressWarnings("unused")
            User user = getAuthenticatedAdmin(authHeader);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            marketplaceService.syncProductToMarketplaces(product);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Product synced successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Sync all pending products
     * POST /api/marketplace/sync-all
     */
    @PostMapping("/sync-all")
    public ResponseEntity<?> syncAllPendingProducts(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            @SuppressWarnings("unused")
            User user = getAuthenticatedAdmin(authHeader);

            marketplaceService.syncAllPendingProducts();

            Map<String, String> response = new HashMap<>();
            response.put("message", "All pending products synced successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get listings for a product
     * GET /api/marketplace/products/{productId}/listings
     */
    @GetMapping("/products/{productId}/listings")
    public ResponseEntity<?> getProductListings(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long productId) {

        try {
            @SuppressWarnings("unused")
            User user = getAuthenticatedAdmin(authHeader);

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            List<MarketplaceListing> listings = marketplaceService.getListingsForProduct(product);

            Map<String, Object> response = new HashMap<>();
            response.put("productId", productId);
            response.put("productName", product.getName());
            response.put("listings", listings);
            response.put("count", listings.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get all active listings by marketplace
     * GET /api/marketplace/listings/{marketplace}
     */
    @GetMapping("/listings/{marketplace}")
    public ResponseEntity<?> getActiveListingsByMarketplace(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable String marketplace) {

        try {
            @SuppressWarnings("unused")
            User user = getAuthenticatedAdmin(authHeader);

            List<MarketplaceListing> listings = marketplaceService.getActiveListingsByMarketplace(marketplace);

            Map<String, Object> response = new HashMap<>();
            response.put("marketplace", marketplace);
            response.put("listings", listings);
            response.put("count", listings.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get marketplace stats (ALL 9 MARKETPLACES)
     * GET /api/marketplace/stats
     */
    @SuppressWarnings("unused")
    @GetMapping("/stats")
    public ResponseEntity<?> getMarketplaceStats(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getAuthenticatedAdmin(authHeader);

            Map<String, Object> stats = new HashMap<>();

            // Original 6 marketplaces
            stats.put("amazon", marketplaceService.countActiveListingsByMarketplace("AMAZON"));
            stats.put("walmart", marketplaceService.countActiveListingsByMarketplace("WALMART"));
            stats.put("ebay", marketplaceService.countActiveListingsByMarketplace("EBAY"));
            stats.put("tiktok", marketplaceService.countActiveListingsByMarketplace("TIKTOK"));
            stats.put("google", marketplaceService.countActiveListingsByMarketplace("GOOGLE"));
            stats.put("etsy", marketplaceService.countActiveListingsByMarketplace("ETSY"));
            
            // NEW: 3 Additional marketplaces
            stats.put("backmarket", marketplaceService.countActiveListingsByMarketplace("BACKMARKET"));
            stats.put("temu", marketplaceService.countActiveListingsByMarketplace("TEMU"));
            stats.put("shopify", marketplaceService.countActiveListingsByMarketplace("SHOPIFY"));

            // Calculate total
            long total = (long) stats.get("amazon") + (long) stats.get("walmart") + 
                        (long) stats.get("ebay") + (long) stats.get("tiktok") +
                        (long) stats.get("google") + (long) stats.get("etsy") +
                        (long) stats.get("backmarket") + (long) stats.get("temu") +
                        (long) stats.get("shopify");
            stats.put("total", total);

            return ResponseEntity.ok(stats);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get supported marketplaces list
     * GET /api/marketplace/supported
     */
    @GetMapping("/supported")
    public ResponseEntity<?> getSupportedMarketplaces(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getAuthenticatedAdmin(authHeader);

            List<Map<String, String>> marketplaces = List.of(
                Map.of("key", "AMAZON", "name", "Amazon", "icon", "🛒"),
                Map.of("key", "WALMART", "name", "Walmart", "icon", "🛍️"),
                Map.of("key", "EBAY", "name", "eBay", "icon", "🏷️"),
                Map.of("key", "TIKTOK", "name", "TikTok Shop", "icon", "🎵"),
                Map.of("key", "GOOGLE", "name", "Google Shopping", "icon", "🔍"),
                Map.of("key", "ETSY", "name", "Etsy", "icon", "🎨"),
                Map.of("key", "BACKMARKET", "name", "Backmarket", "icon", "♻️"),
                Map.of("key", "TEMU", "name", "Temu", "icon", "📦"),
                Map.of("key", "SHOPIFY", "name", "Shopify", "icon", "🛒")
            );

            Map<String, Object> response = new HashMap<>();
            response.put("marketplaces", marketplaces);
            response.put("count", marketplaces.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}