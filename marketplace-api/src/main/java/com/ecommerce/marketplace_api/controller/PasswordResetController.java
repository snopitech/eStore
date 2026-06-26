package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.ForgotPasswordRequest;
import com.ecommerce.marketplace_api.dto.PasswordResetResponse;
import com.ecommerce.marketplace_api.dto.ResetPasswordRequest;
import com.ecommerce.marketplace_api.service.EmailService;
import com.ecommerce.marketplace_api.service.PasswordResetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;
    private final EmailService emailService;

    public PasswordResetController(PasswordResetService passwordResetService, EmailService emailService) {
        this.passwordResetService = passwordResetService;
        this.emailService = emailService;
    }

    // ===== ADMIN PASSWORD RESET ENDPOINTS =====
    
    // Admin Forgot Password - Sends reset link to Admin Dashboard (port 5174)
    @PostMapping("/admin/forgot-password")
    public ResponseEntity<?> adminForgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String email = request.getEmail();
            String token = passwordResetService.createResetToken(email);
            
            // Build reset link for ADMIN dashboard
            String resetLink = "http://localhost:5174/admin-reset-password?token=" + token;
            
            // Send email with reset link
            emailService.sendPasswordResetEmail(email, resetLink);
            
            return ResponseEntity.ok(new PasswordResetResponse(
                "Password reset link sent to your email", 
                true
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new PasswordResetResponse(
                e.getMessage(), 
                false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new PasswordResetResponse(
                    "Failed to send reset email. Please try again.", 
                    false
                ));
        }
    }

    // Admin Reset Password
    @PostMapping("/admin/reset-password")
    public ResponseEntity<?> adminResetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            String token = request.getToken();
            String newPassword = request.getNewPassword();
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(new PasswordResetResponse(
                    "Password must be at least 6 characters", 
                    false
                ));
            }
            
            passwordResetService.resetPassword(token, newPassword);
            
            return ResponseEntity.ok(new PasswordResetResponse(
                "Password reset successfully. You can now login with your new password.", 
                true
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new PasswordResetResponse(
                e.getMessage(), 
                false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new PasswordResetResponse(
                    "Failed to reset password. Please try again.", 
                    false
                ));
        }
    }

    // ===== CUSTOMER PASSWORD RESET ENDPOINTS =====
    
    // Customer Forgot Password - Sends reset link to eStore (port 5173)
    @PostMapping("/customer/forgot-password")
    public ResponseEntity<?> customerForgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String email = request.getEmail();
            String token = passwordResetService.createResetToken(email);
            
            // Build reset link for eStore (customer frontend)
            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            
            // Send email with reset link
            emailService.sendPasswordResetEmail(email, resetLink);
            
            return ResponseEntity.ok(new PasswordResetResponse(
                "Password reset link sent to your email", 
                true
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new PasswordResetResponse(
                e.getMessage(), 
                false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new PasswordResetResponse(
                    "Failed to send reset email. Please try again.", 
                    false
                ));
        }
    }

    // Customer Reset Password
    @PostMapping("/customer/reset-password")
    public ResponseEntity<?> customerResetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            String token = request.getToken();
            String newPassword = request.getNewPassword();
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(new PasswordResetResponse(
                    "Password must be at least 6 characters", 
                    false
                ));
            }
            
            passwordResetService.resetPassword(token, newPassword);
            
            return ResponseEntity.ok(new PasswordResetResponse(
                "Password reset successfully. You can now login with your new password.", 
                true
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new PasswordResetResponse(
                e.getMessage(), 
                false
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new PasswordResetResponse(
                    "Failed to reset password. Please try again.", 
                    false
                ));
        }
    }

    // ===== SHARED ENDPOINTS =====
    
    // Validate reset token (works for both admin and customer)
    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            passwordResetService.validateResetToken(token);
            return ResponseEntity.ok().body(new PasswordResetResponse(
                "Token is valid", 
                true
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new PasswordResetResponse(
                e.getMessage(), 
                false
            ));
        }
    }

    // Test email endpoint
    @GetMapping("/test-email")
    public ResponseEntity<?> testEmail() {
        try {
            emailService.sendPasswordResetEmail(
                "snopitech@gmail.com", 
                "http://localhost:5174/admin-reset-password?token=test123"
            );
            return ResponseEntity.ok("Test email sent! Check your inbox.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Email failed: " + e.getMessage());
        }
    }
}