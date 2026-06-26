package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.StripeConnectRequest;
import com.ecommerce.marketplace_api.dto.StripeConnectResponse;
import com.ecommerce.marketplace_api.model.SellerProfile;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.StripeConnectService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/connect")
public class StripeConnectController {

    private final StripeConnectService stripeConnectService;
    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final JwtUtil jwtUtil;

    public StripeConnectController(StripeConnectService stripeConnectService,
                                   UserRepository userRepository,
                                   SellerProfileRepository sellerProfileRepository,
                                   JwtUtil jwtUtil) {
        this.stripeConnectService = stripeConnectService;
        this.userRepository = userRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Create a Stripe Connect account for the seller
     * POST /api/connect/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createConnectAccount(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody StripeConnectRequest request) {

        try {
            User user = getAuthenticatedUser(authHeader);

            if (user.getUserType() != UserType.SELLER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can create Stripe Connect accounts");
            }

            StripeConnectResponse response = stripeConnectService.createConnectAccount(
                user,
                request.getBusinessName(),
                request.getPhone()
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get Stripe Connect account status
     * GET /api/connect/status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getConnectStatus(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getAuthenticatedUser(authHeader);

            if (user.getUserType() != UserType.SELLER) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only sellers can access this");
            }

            SellerProfile sellerProfile = sellerProfileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Seller profile not found"));

            Map<String, Object> status = stripeConnectService.getAccountStatus(sellerProfile);

            return ResponseEntity.ok(status);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Redirect URI for Stripe Connect onboarding
     * GET /api/connect/return
     */
    @GetMapping("/return")
    public ResponseEntity<?> connectReturn(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String accountId) {

        try {
            String message = "Stripe Connect account setup ";
            if ("success".equals(status)) {
                message += "successfully! You can now receive payouts.";

                // Update seller profile status
                if (accountId != null) {
                    sellerProfileRepository.findByStripeConnectAccountId(accountId)
                        .ifPresent(profile -> {
                            profile.setStripeConnectStatus("ACTIVE");
                            profile.setStripeConnectVerified(true);
                            sellerProfileRepository.save(profile);
                            System.out.println("✅ Stripe Connect account verified: " + accountId);
                        });
                }

            } else if ("refresh".equals(status)) {
                message += "needs refresh. Please try again.";
            } else {
                message += "was cancelled.";
            }

            return ResponseEntity.ok(message);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
