package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.SellerProfileRequest;
import com.ecommerce.marketplace_api.dto.SellerProfileResponse;
import com.ecommerce.marketplace_api.model.SellerProfile;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings("unused")
@Service
public class SellerProfileService {
    
    private final SellerProfileRepository sellerProfileRepository;
    
    private final UserRepository userRepository;

    SellerProfileService(SellerProfileRepository sellerProfileRepository, UserRepository userRepository) {
        this.sellerProfileRepository = sellerProfileRepository;
        this.userRepository = userRepository;
    }
    
    public SellerProfileResponse createSellerProfile(Long userId, SellerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user already has a seller profile
        if (sellerProfileRepository.findByUser(user).isPresent()) {
            throw new RuntimeException("Seller profile already exists");
        }
        
        // Check if store slug is unique
        if (sellerProfileRepository.existsByStoreSlug(request.getStoreSlug())) {
            throw new RuntimeException("Store slug already taken");
        }
        
        // Update user type to SELLER
        user.setUserType(UserType.SELLER);
        userRepository.save(user);
        
        // Create seller profile
        SellerProfile profile = new SellerProfile();
        profile.setUser(user);
        profile.setStoreName(request.getStoreName());
        profile.setStoreSlug(request.getStoreSlug());
        profile.setStoreDescription(request.getStoreDescription());
        profile.setStoreLogoUrl(request.getStoreLogoUrl());
        profile.setStoreBannerUrl(request.getStoreBannerUrl());
        
        SellerProfile saved = sellerProfileRepository.save(profile);
        
        return convertToResponse(saved);
    }
    
    public SellerProfileResponse getSellerProfileByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SellerProfile profile = sellerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        return convertToResponse(profile);
    }
    
    public SellerProfileResponse getSellerProfileBySlug(String storeSlug) {
        SellerProfile profile = sellerProfileRepository.findByStoreSlug(storeSlug)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        
        return convertToResponse(profile);
    }
    
    public SellerProfileResponse updateSellerProfile(Long userId, SellerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SellerProfile profile = sellerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        // Update fields
        profile.setStoreName(request.getStoreName());
        profile.setStoreDescription(request.getStoreDescription());
        profile.setStoreLogoUrl(request.getStoreLogoUrl());
        profile.setStoreBannerUrl(request.getStoreBannerUrl());
        
        // Check if slug is being changed and is unique
        if (!profile.getStoreSlug().equals(request.getStoreSlug())) {
            if (sellerProfileRepository.existsByStoreSlug(request.getStoreSlug())) {
                throw new RuntimeException("Store slug already taken");
            }
            profile.setStoreSlug(request.getStoreSlug());
        }
        
        SellerProfile updated = sellerProfileRepository.save(profile);
        return convertToResponse(updated);
    }
    
    private SellerProfileResponse convertToResponse(SellerProfile profile) {
        return new SellerProfileResponse(
            profile.getId(),
            profile.getUser().getId(),
            profile.getUser().getEmail(),
            profile.getStoreName(),
            profile.getStoreSlug(),
            profile.getStoreDescription(),
            profile.getStoreLogoUrl(),
            profile.getStoreBannerUrl(),
            profile.getRating(),
            profile.getTotalSales(),
            profile.getTotalProducts()
        );
    }
}