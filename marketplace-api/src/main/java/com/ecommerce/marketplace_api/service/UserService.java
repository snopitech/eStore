package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.RegisterRequest;
import com.ecommerce.marketplace_api.model.SellerProfile;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@SuppressWarnings("unused")
@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;

    UserService(UserRepository userRepository, SellerProfileRepository sellerProfileRepository) {
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
    }
    
    @Transactional
    public Long registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // Plain text password
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        if ("SELLER".equalsIgnoreCase(request.getUserType())) {
            user.setUserType(UserType.SELLER);
        } else {
            user.setUserType(UserType.BUYER);
        }
        
        User savedUser = userRepository.save(user);
        
        // If user is a seller, create seller profile automatically
        if (savedUser.getUserType() == UserType.SELLER) {
            createSellerProfile(savedUser, request);
        }
        
        return savedUser.getId();
    }
    
    private void createSellerProfile(User user, RegisterRequest request) {
        try {
            SellerProfile sellerProfile = new SellerProfile();
            sellerProfile.setUser(user);
            
            String storeName = request.getBusinessName() != null && !request.getBusinessName().isEmpty() 
                ? request.getBusinessName() 
                : user.getFirstName() + "'s Store";
            sellerProfile.setStoreName(storeName);
            
            String baseSlug = request.getBusinessName() != null && !request.getBusinessName().isEmpty()
                ? request.getBusinessName().toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-")
                : user.getFirstName().toLowerCase() + "-store";
            
            baseSlug = baseSlug.replaceAll("^-+|-+$", "");
            
            if (baseSlug.isEmpty()) {
                baseSlug = "store-" + user.getId();
            }
            
            String storeSlug = baseSlug;
            int counter = 1;
            while (sellerProfileRepository.existsByStoreSlug(storeSlug)) {
                storeSlug = baseSlug + "-" + counter++;
                if (counter > 100) {
                    storeSlug = baseSlug + "-" + System.currentTimeMillis();
                    break;
                }
            }
            sellerProfile.setStoreSlug(storeSlug);
            
            sellerProfile.setStoreDescription("Welcome to my store!");
            sellerProfile.setIsApproved(false);
            sellerProfile.setIsActive(true);
            sellerProfile.setCreatedAt(LocalDateTime.now());
            sellerProfile.setUpdatedAt(LocalDateTime.now());
            
            sellerProfileRepository.save(sellerProfile);
            System.out.println("✅ Seller profile created for user: " + user.getEmail());
            
        } catch (Exception e) {
            System.err.println("❌ Failed to create seller profile for user " + user.getEmail() + ": " + e.getMessage());
        }
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Plain text password comparison
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        
        return user;
    }
}