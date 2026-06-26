package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/test")
public class EmailTestController {
    
    private final EmailService emailService;

    EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }
    
    @PostMapping("/send-email")
    public ResponseEntity<?> sendTestEmail(@RequestParam String to) {
        try {
            emailService.sendSellerApprovalEmail(to, "Test User", "Test Store");
            return ResponseEntity.ok("Email sent successfully to " + to);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
}