package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.MarketplaceListing;
import com.ecommerce.marketplace_api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface MarketplaceListingRepository extends JpaRepository<MarketplaceListing, Long> {

    List<MarketplaceListing> findByProduct(Product product);

    Optional<MarketplaceListing> findByProductAndMarketplace(Product product, String marketplace);

    // ADD THESE TWO METHODS:
    List<MarketplaceListing> findByProductAndIsActiveTrue(Product product);

    List<MarketplaceListing> findByMarketplaceAndIsActiveTrue(String marketplace);

    List<MarketplaceListing> findByMarketplaceAndListingStatus(String marketplace, String status);

    @Query("SELECT m FROM MarketplaceListing m WHERE m.syncStatus = 'PENDING'")
    List<MarketplaceListing> findPendingSync();

    @Query("SELECT COUNT(m) FROM MarketplaceListing m WHERE m.marketplace = :marketplace AND m.isActive = true")
    long countActiveListingsByMarketplace(@Param("marketplace") String marketplace);

    @Query("SELECT m FROM MarketplaceListing m WHERE m.marketplace = :marketplace AND m.listingStatus = 'ACTIVE'")
    List<MarketplaceListing> findActiveListingsByMarketplace(@Param("marketplace") String marketplace);
}