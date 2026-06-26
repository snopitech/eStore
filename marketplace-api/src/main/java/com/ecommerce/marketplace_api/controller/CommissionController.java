package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.model.Commission;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.CommissionService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService commissionService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public CommissionController(CommissionService commissionService,
                                UserRepository userRepository,
                                JwtUtil jwtUtil) {
        this.commissionService = commissionService;
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

    // ===== SELLER ENDPOINTS =====

    /**
     * Get my commission summary
     * GET /api/commissions/my-summary
     */
    @GetMapping("/my-summary")
    public ResponseEntity<?> getMyCommissionSummary(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getAuthenticatedUser(authHeader);

            BigDecimal pending = commissionService.getTotalPendingCommission(user);
            BigDecimal paid = commissionService.getTotalPaidCommission(user);
            BigDecimal total = commissionService.getTotalCommission(user);
            long pendingCount = commissionService.countPendingCommissions(user);

            Map<String, Object> response = new HashMap<>();
            response.put("pendingAmount", pending);
            response.put("paidAmount", paid);
            response.put("totalAmount", total);
            response.put("pendingCount", pendingCount);
            response.put("currency", "USD");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get my commissions
     * GET /api/commissions/my-commissions
     */
    @GetMapping("/my-commissions")
    public ResponseEntity<?> getMyCommissions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getAuthenticatedUser(authHeader);

            List<Commission> commissions = commissionService.getCommissionsBySeller(user);

            Map<String, Object> response = new HashMap<>();
            response.put("commissions", commissions);
            response.put("count", commissions.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Get my pending commissions
     * GET /api/commissions/my-pending
     */
    @GetMapping("/my-pending")
    public ResponseEntity<?> getMyPendingCommissions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getAuthenticatedUser(authHeader);

            List<Commission> commissions = commissionService.getPendingCommissionsBySeller(user);

            Map<String, Object> response = new HashMap<>();
            response.put("commissions", commissions);
            response.put("count", commissions.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Request payout for pending commissions
     * POST /api/commissions/request-payout
     */
    @PostMapping("/request-payout")
    public ResponseEntity<?> requestPayout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            User user = getAuthenticatedUser(authHeader);

            long pendingCount = commissionService.countPendingCommissions(user);

            if (pendingCount == 0) {
                return ResponseEntity.badRequest().body("No pending commissions to payout");
            }

            List<Commission> paidCommissions = commissionService.processPayoutForSeller(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Payout requested successfully");
            response.put("commissionsProcessed", paidCommissions.size());
            response.put("totalAmount", commissionService.getTotalPaidCommission(user));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== ADMIN ENDPOINTS =====

    /**
     * Get all pending commissions (Admin only)
     * GET /api/commissions/admin/pending
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<?> getPendingCommissions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);

            List<Commission> commissions = commissionService.getAllPendingCommissions();

            Map<String, Object> response = new HashMap<>();
            response.put("commissions", commissions);
            response.put("count", commissions.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Mark commission as paid (Admin only)
     * PUT /api/commissions/admin/{commissionId}/pay
     */
    @PutMapping("/admin/{commissionId}/pay")
    public ResponseEntity<?> markCommissionAsPaid(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long commissionId) {

        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);

            Commission commission = commissionService.markCommissionAsPaid(commissionId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Commission marked as paid");
            response.put("commission", commission);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Process all pending payouts (Admin only)
     * POST /api/commissions/admin/process-all
     */
    @PostMapping("/admin/process-all")
    public ResponseEntity<?> processAllPayouts(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);

            List<Commission> pendingCommissions = commissionService.getAllPendingCommissions();

            if (pendingCommissions.isEmpty()) {
                return ResponseEntity.badRequest().body("No pending commissions to process");
            }

            for (Commission commission : pendingCommissions) {
                commissionService.markCommissionAsPaid(commission.getId());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "All pending commissions processed successfully");
            response.put("processedCount", pendingCommissions.size());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
