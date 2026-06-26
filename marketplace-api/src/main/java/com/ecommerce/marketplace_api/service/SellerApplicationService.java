package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.SellerApplicationRequest;
import com.ecommerce.marketplace_api.dto.SellerApplicationResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.SellerApplicationRepository;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class SellerApplicationService {
    
    private final SellerApplicationRepository sellerApplicationRepository;
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final EmailService emailService;

    SellerApplicationService(SellerApplicationRepository sellerApplicationRepository, 
                            SellerProfileRepository sellerProfileRepository, 
                            EmailService emailService, 
                            UserRepository userRepository) {
        this.sellerApplicationRepository = sellerApplicationRepository;
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.emailService = emailService;
    }
    
    public SellerApplicationResponse applyForSeller(Long userId, SellerApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (sellerApplicationRepository.findByUser(user).isPresent()) {
            throw new RuntimeException("You have already applied to become a seller");
        }
        
        if (user.getUserType() == UserType.SELLER) {
            throw new RuntimeException("You are already a seller");
        }
        
        SellerApplication application = new SellerApplication();
        application.setUser(user);
        application.setPhoneNumber(request.getPhoneNumber());
        application.setAddress(request.getAddress());
        application.setGoodsToSell(request.getGoodsToSell());
        application.setBusinessName(request.getBusinessName());
        application.setBusinessAddress(request.getBusinessAddress());
        application.setStatus(ApplicationStatus.PENDING);
        
        SellerApplication saved = sellerApplicationRepository.save(application);
        return convertToResponse(saved);
    }
    
    public List<SellerApplicationResponse> getPendingApplications() {
        return sellerApplicationRepository.findByStatus(ApplicationStatus.PENDING).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public SellerApplicationResponse getApplicationByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SellerApplication application = sellerApplicationRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        return convertToResponse(application);
    }
    
    @Transactional
    public SellerApplicationResponse approveApplication(Long applicationId, Long adminId) {
        System.out.println("📝 Processing approval for application: " + applicationId);
        
        SellerApplication application = sellerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Application is not pending");
        }
        
        application.setStatus(ApplicationStatus.APPROVED);
        application.setReviewedBy(adminId);
        application.setReviewedAt(LocalDateTime.now());
        sellerApplicationRepository.save(application);
        
        User user = application.getUser();
        user.setUserType(UserType.SELLER);
        userRepository.save(user);
        
        // Create seller profile
        SellerProfile sellerProfile = new SellerProfile();
        sellerProfile.setUser(user);
        
        String storeName = application.getBusinessName() != null && !application.getBusinessName().isEmpty() 
            ? application.getBusinessName() 
            : user.getFirstName() + "'s Store";
        sellerProfile.setStoreName(storeName);
        
        String storeSlug = application.getBusinessName() != null && !application.getBusinessName().isEmpty()
            ? application.getBusinessName().toLowerCase().replaceAll("[^a-z0-9]", "-").replaceAll("-+", "-")
            : user.getFirstName().toLowerCase() + "-store";
        sellerProfile.setStoreSlug(storeSlug);
        
        sellerProfile.setStoreDescription("Welcome to my store!");
        sellerProfile.setIsApproved(true);
        sellerProfile.setIsActive(true);
        sellerProfileRepository.save(sellerProfile);
        
        System.out.println("✅ Seller profile created for: " + user.getEmail());
        
        // Send approval email
        try {
            emailService.sendSellerApprovalEmail(
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName(),
                storeName
            );
            System.out.println("✅ Approval email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send approval email to " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - email failure shouldn't break the transaction
        }
        
        return convertToResponse(application);
    }
    
    @Transactional
    public SellerApplicationResponse rejectApplication(Long applicationId, Long adminId, String reason) {
        System.out.println("📝 Processing rejection for application: " + applicationId);
        
        SellerApplication application = sellerApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Application is not pending");
        }
        
        application.setStatus(ApplicationStatus.REJECTED);
        application.setReviewedBy(adminId);
        application.setReviewedAt(LocalDateTime.now());
        application.setRejectionReason(reason);
        sellerApplicationRepository.save(application);
        
        User user = application.getUser();
        
        // Send rejection email
        try {
            emailService.sendSellerRejectionEmail(
                user.getEmail(),
                user.getFirstName() + " " + user.getLastName(),
                reason
            );
            System.out.println("✅ Rejection email sent to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send rejection email to " + user.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
            // Don't throw exception - email failure shouldn't break the transaction
        }
        
        return convertToResponse(application);
    }
    
    private SellerApplicationResponse convertToResponse(SellerApplication application) {
        SellerApplicationResponse response = new SellerApplicationResponse();
        response.setId(application.getId());
        response.setUserId(application.getUser().getId());
        response.setEmail(application.getUser().getEmail());
        response.setPhoneNumber(application.getPhoneNumber());
        response.setAddress(application.getAddress());
        response.setGoodsToSell(application.getGoodsToSell());
        response.setBusinessName(application.getBusinessName());
        response.setBusinessAddress(application.getBusinessAddress());
        response.setStatus(application.getStatus().name());
        response.setRejectionReason(application.getRejectionReason());
        response.setCreatedAt(application.getCreatedAt());
        return response;
    }
}