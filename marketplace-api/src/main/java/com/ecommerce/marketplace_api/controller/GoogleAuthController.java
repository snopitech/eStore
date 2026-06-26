package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.LoginResponse;
import com.ecommerce.marketplace_api.service.GoogleAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;

    GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    // ===== GOOGLE LOGIN =====
    @PostMapping("/google")
    public ResponseEntity<LoginResponse> googleLogin(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        
        System.out.println("=== GOOGLE LOGIN REQUEST ===");
        System.out.println("Token received: " + (token != null ? token.substring(0, Math.min(token.length(), 50)) + "..." : "null"));
        
        if (token == null || token.isEmpty()) {
            System.out.println("Token is null or empty");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            LoginResponse response = googleAuthService.authenticateGoogleUser(token);
            System.out.println("Google login successful for: " + response.getEmail());
            System.out.println("User first name: " + response.getFirstName());
            System.out.println("User last name: " + response.getLastName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Google login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // ===== GOOGLE REGISTRATION =====
    @PostMapping("/google/register")
    public ResponseEntity<Map<String, String>> googleRegister(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String userType = request.getOrDefault("userType", "BUYER");
        
        System.out.println("=== GOOGLE REGISTRATION REQUEST ===");
        System.out.println("Token received: " + (token != null ? token.substring(0, Math.min(token.length(), 50)) + "..." : "null"));
        System.out.println("UserType: " + userType);
        
        if (token == null || token.isEmpty()) {
            System.out.println("Token is null or empty");
            return ResponseEntity.badRequest().body(Map.of("message", "Token is required"));
        }
        
        try {
            String message = googleAuthService.registerGoogleUser(token, userType);
            System.out.println("Google registration successful: " + message);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            System.err.println("Google registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", e.getMessage()));
        }
    }
}