package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.InventorySourceRequest;
import com.ecommerce.marketplace_api.dto.InventorySourceResponse;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.service.InventorySourceService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/inventory-sources")
public class InventorySourceController {

    private final InventorySourceService inventorySourceService;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public InventorySourceController(InventorySourceService inventorySourceService,
                                     UserRepository userRepository,
                                     JwtUtil jwtUtil) {
        this.inventorySourceService = inventorySourceService;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ===== HELPER =====
    private User getAuthenticatedAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getUserType() != UserType.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
        return user;
    }

    // ===== CREATE =====
    @PostMapping
    public ResponseEntity<?> createInventorySource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody InventorySourceRequest request) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            InventorySourceResponse response = inventorySourceService.createInventorySource(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== GET ALL =====
    @GetMapping
    public ResponseEntity<?> getAllInventorySources(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            List<InventorySourceResponse> sources = inventorySourceService.getAllInventorySources();
            return ResponseEntity.ok(sources);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== GET ACTIVE =====
    @GetMapping("/active")
    public ResponseEntity<?> getActiveInventorySources(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            List<InventorySourceResponse> sources = inventorySourceService.getActiveInventorySources();
            return ResponseEntity.ok(sources);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== GET BY ID =====
    @GetMapping("/{id}")
    public ResponseEntity<?> getInventorySourceById(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            InventorySourceResponse source = inventorySourceService.getInventorySourceById(id);
            return ResponseEntity.ok(source);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== UPDATE =====
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInventorySource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id,
            @RequestBody InventorySourceRequest request) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            InventorySourceResponse response = inventorySourceService.updateInventorySource(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== DELETE (Soft Delete) =====
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInventorySource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            inventorySourceService.deleteInventorySource(id);
            return ResponseEntity.ok("Inventory source deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== ACTIVATE =====
    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateInventorySource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            inventorySourceService.activateInventorySource(id);
            return ResponseEntity.ok("Inventory source activated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ===== DEACTIVATE =====
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateInventorySource(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        try {
            @SuppressWarnings("unused")
            User admin = getAuthenticatedAdmin(authHeader);
            inventorySourceService.deactivateInventorySource(id);
            return ResponseEntity.ok("Inventory source deactivated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}