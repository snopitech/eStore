package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.SellerProfile;
import com.ecommerce.marketplace_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {
    
    Optional<SellerProfile> findByUser(User user);
    
    Optional<SellerProfile> findByUserId(Long userId);
    
    Optional<SellerProfile> findByStoreSlug(String storeSlug);
    
    boolean existsByStoreSlug(String storeSlug);

    // ===== NEW: FIND BY STRIPE CONNECT ACCOUNT ID =====
    Optional<SellerProfile> findByStripeConnectAccountId(String stripeConnectAccountId);
}