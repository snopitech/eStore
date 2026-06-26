package com.ecommerce.marketplace_api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@SuppressWarnings("unused")
@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;

    EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ===== GENERIC SEND EMAIL =====
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("📧 Email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendEmail(String to, String subject, String body, String from) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from != null ? from : fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("📧 Email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ===== SELLER APPLICATION EMAILS =====
    public void sendSellerApprovalEmail(String toEmail, String name, String storeName) {
        try {
            String subject = "🎉 Welcome to eStore - Your Seller Account is Approved!";
            String body = String.format(
                "Dear %s,\n\n" +
                "Congratulations! Your seller application for '%s' has been APPROVED.\n\n" +
                "You can now:\n" +
                "✅ List your products on eStore\n" +
                "✅ Manage your store inventory\n" +
                "✅ Track your sales and earnings\n\n" +
                "To get started, log in to your seller dashboard:\n" +
                "https://estore.snopitech.com/seller/dashboard\n\n" +
                "Welcome to the eStore community!\n\n" +
                "Best regards,\n" +
                "The eStore Team",
                name, storeName
            );
            
            sendEmail(toEmail, subject, body);
            System.out.println("✅ Approval email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send approval email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void sendSellerRejectionEmail(String toEmail, String name, String reason) {
        try {
            String subject = "📝 eStore Seller Application Update";
            String body = String.format(
                "Dear %s,\n\n" +
                "Thank you for your interest in becoming a seller on eStore.\n\n" +
                "After careful review, your seller application has been DECLINED.\n\n" +
                "Reason: %s\n\n" +
                "If you have any questions, please contact our support team.\n\n" +
                "Best regards,\n" +
                "The eStore Team",
                name, reason
            );
            
            sendEmail(toEmail, subject, body);
            System.out.println("✅ Rejection email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send rejection email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // ===== SELLER DISABLE/ENABLE/REMOVE EMAILS =====
    
    public void sendSellerDisabledEmail(String toEmail, String sellerName, String storeName, String adminName) {
        try {
            String subject = "🔒 Your Seller Account Has Been Disabled";
            String body = String.format(
                "Dear %s,\n\n" +
                "We hope this message finds you well.\n\n" +
                "We are writing to inform you that your seller account for '%s' has been DISABLED by %s.\n\n" +
                "What this means:\n" +
                "❌ You can no longer list new products\n" +
                "❌ Your existing products have been deactivated\n" +
                "❌ You cannot sell on eStore at this time\n\n" +
                "However, you can still:\n" +
                "✅ Log in to your account\n" +
                "✅ Continue shopping as a buyer\n" +
                "✅ Access your order history\n\n" +
                "If you believe this was done in error or have any questions, please contact our support team.\n\n" +
                "Best regards,\n" +
                "The eStore Team",
                sellerName, storeName, adminName
            );
            
            sendEmail(toEmail, subject, body);
            System.out.println("✅ Disabled email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send disabled email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void sendSellerEnabledEmail(String toEmail, String sellerName, String storeName, String adminName) {
        try {
            String subject = "✅ Your Seller Account Has Been Re-enabled";
            String body = String.format(
                "Dear %s,\n\n" +
                "Good news! We are happy to inform you that your seller account for '%s' has been RE-ENABLED by %s.\n\n" +
                "What this means:\n" +
                "✅ You can now list new products\n" +
                "✅ Your existing products have been reactivated\n" +
                "✅ You can sell on eStore again\n\n" +
                "To get started, log in to your seller dashboard:\n" +
                "https://estore.snopitech.com/seller/dashboard\n\n" +
                "We're excited to have you back!\n\n" +
                "Best regards,\n" +
                "The eStore Team",
                sellerName, storeName, adminName
            );
            
            sendEmail(toEmail, subject, body);
            System.out.println("✅ Enabled email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send enabled email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void sendSellerRemovedEmail(String toEmail, String sellerName, String storeName, String adminName) {
        try {
            String subject = "📋 Your Seller Account Has Been Removed";
            String body = String.format(
                "Dear %s,\n\n" +
                "We are writing to inform you that your seller account for '%s' has been REMOVED by %s.\n\n" +
                "What this means:\n" +
                "❌ Your seller privileges have been revoked\n" +
                "❌ All your products have been deactivated\n" +
                "❌ You can no longer sell on eStore\n\n" +
                "However, you can still:\n" +
                "✅ Log in to your account\n" +
                "✅ Continue shopping as a buyer\n" +
                "✅ Access your order history\n\n" +
                "If you believe this was done in error or have any questions, please contact our support team.\n\n" +
                "Best regards,\n" +
                "The eStore Team",
                sellerName, storeName, adminName
            );
            
            sendEmail(toEmail, subject, body);
            System.out.println("✅ Removed email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send removed email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // ===== PASSWORD RESET EMAIL =====
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            String subject = "🔑 Reset Your Password - eStore";
            String body = String.format(
                "Dear User,\n\n" +
                "We received a request to reset your password for your eStore account.\n\n" +
                "Click the link below to reset your password:\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Best regards,\n" +
                "The eStore Team",
                resetLink
            );
            
            sendEmail(toEmail, subject, body);
            System.out.println("✅ Password reset email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send password reset email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // ===== MARKETPLACE ORDER NOTIFICATION TO SELLER =====
    public void sendMarketplaceOrderNotificationToSeller(
            String toEmail, 
            String sellerName, 
            String productName, 
            String marketplace, 
            String marketplaceOrderId,
            int quantity,
            double price,
            double commission,
            String customerName,
            String shippingAddress,
            String orderDate) {
        
        try {
            String subject = "🛒 Your Product Sold on " + marketplace + "!";
            
            String body = String.format(
                "Dear %s,\n\n" +
                "Good news! Your product \"%s\" has been SOLD on %s!\n\n" +
                "📋 Sale Details:\n" +
                "─────────────────────────────\n" +
                "Platform: %s\n" +
                "Order Number: %s\n" +
                "Product: %s\n" +
                "Quantity: %d\n" +
                "Sale Price: $%.2f\n" +
                "Your Commission (95%%): $%.2f\n" +
                "Order Date: %s\n" +
                "─────────────────────────────\n\n" +
                "👤 Customer Information:\n" +
                "─────────────────────────────\n" +
                "Name: %s\n" +
                "Shipping Address: %s\n" +
                "─────────────────────────────\n\n" +
                "⚠️ Action Required:\n" +
                "─────────────────────────────\n" +
                "Please prepare and ship this order as soon as possible.\n" +
                "You have 3 days to ship the order.\n" +
                "─────────────────────────────\n\n" +
                "📦 Shipping Instructions:\n" +
                "─────────────────────────────\n" +
                "1. Pack the item securely\n" +
                "2. Add tracking number to your seller dashboard\n" +
                "3. Mark order as shipped\n" +
                "─────────────────────────────\n\n" +
                "You can view all your sales in the seller dashboard.\n\n" +
                "Thank you for selling on eStore!\n\n" +
                "Best regards,\n" +
                "The eStore Team",
                sellerName,
                productName,
                marketplace,
                marketplace,
                marketplaceOrderId,
                productName,
                quantity,
                price,
                commission,
                orderDate,
                customerName,
                shippingAddress
            );
            
            sendEmail(toEmail, subject, body);
            System.out.println("✅ Marketplace order notification sent to seller: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to send marketplace order notification to seller: " + e.getMessage());
            e.printStackTrace();
        }
    }
}