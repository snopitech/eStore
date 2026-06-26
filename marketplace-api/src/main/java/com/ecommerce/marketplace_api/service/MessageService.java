package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.MessageRequest;
import com.ecommerce.marketplace_api.dto.MessageResponse;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public MessageService(ProductRepository productRepository, 
                          UserRepository userRepository, 
                          EmailService emailService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        System.out.println("=== MESSAGE SERVICE INITIALIZED ===");
    }

    public MessageResponse sendMessage(MessageRequest request) {
        try {
            System.out.println("=== SENDING MESSAGE ===");
            System.out.println("Product ID: " + request.getProductId());
            System.out.println("Seller ID received: " + request.getSellerId());

            // Get product details
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            System.out.println("Product found: " + product.getName());

            // Get seller from the product's seller profile
            User seller = null;
            
            if (product.getSeller() != null) {
                // Product has a seller profile, get the user from it
                seller = product.getSeller().getUser();
                System.out.println("Seller found via product: " + seller.getEmail());
            }
            
            // If still null, try finding by the sellerId as a fallback
            if (seller == null && request.getSellerId() != null) {
                // Try to find user by ID directly
                seller = userRepository.findById(request.getSellerId()).orElse(null);
                if (seller != null) {
                    System.out.println("Seller found by ID: " + seller.getEmail());
                }
            }

            if (seller == null) {
                System.err.println("No seller found!");
                throw new RuntimeException("Seller not found. Please contact support.");
            }

            System.out.println("Seller found: " + seller.getEmail());

            // Get buyer details
            String buyerName = request.getBuyerName() != null ? request.getBuyerName() : "A buyer";
            String buyerEmail = request.getBuyerEmail() != null ? request.getBuyerEmail() : "unknown@email.com";

            // Send email to seller
            String sellerEmailBody = String.format(
                "Hello %s,\n\n" +
                "You have received a new inquiry about your product:\n" +
                "Product: %s\n" +
                "Buyer: %s\n" +
                "Buyer Email: %s\n" +
                "Subject: %s\n\n" +
                "Message:\n%s\n\n" +
                "Please respond to the buyer directly by replying to this email.\n\n" +
                "Thank you,\n" +
                "eStore Team",
                seller.getFirstName() != null ? seller.getFirstName() : "Seller",
                product.getName(),
                buyerName,
                buyerEmail,
                request.getSubject(),
                request.getMessage()
            );

            emailService.sendEmail(
                seller.getEmail(),
                "New Inquiry: " + request.getSubject(),
                sellerEmailBody
            );

            // Send copy to app owner
            String ownerEmailBody = String.format(
                "New inquiry from a buyer:\n\n" +
                "Product: %s\n" +
                "Seller: %s (%s)\n" +
                "Buyer: %s (%s)\n" +
                "Subject: %s\n\n" +
                "Message:\n%s",
                product.getName(),
                seller.getFirstName() + " " + seller.getLastName(),
                seller.getEmail(),
                buyerName,
                buyerEmail,
                request.getSubject(),
                request.getMessage()
            );

            emailService.sendEmail(
                "snopitech@gmail.com",
                "New Buyer Inquiry for " + product.getName(),
                ownerEmailBody
            );

            System.out.println("Messages sent successfully!");
            return new MessageResponse(true, "Message sent successfully");

        } catch (Exception e) {
            System.err.println("Error in sendMessage: " + e.getMessage());
            e.printStackTrace();
            return new MessageResponse(false, "Failed to send message: " + e.getMessage());
        }
    }

    public List<MessageResponse> getMessagesForSeller(Long sellerId) {
        // Implement if you want to store messages in database
        return List.of();
    }

    public MessageResponse replyToMessage(MessageRequest request) {
        try {
            // Get buyer's email and name from request
            String buyerEmail = request.getBuyerEmail();
            String buyerName = request.getBuyerName() != null ? request.getBuyerName() : "Buyer";

            // Send reply email to buyer
            String buyerEmailBody = String.format(
                "Hello %s,\n\n" +
                "The seller has responded to your inquiry:\n\n" +
                "Product: %s\n\n" +
                "Seller's Response:\n%s\n\n" +
                "You can continue the conversation by replying to this email.\n\n" +
                "Thank you,\n" +
                "eStore Team",
                buyerName,
                request.getProductName(),
                request.getMessage()
            );

            emailService.sendEmail(
                buyerEmail,
                "Reply to your inquiry: " + request.getSubject(),
                buyerEmailBody
            );

            return new MessageResponse(true, "Reply sent successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return new MessageResponse(false, "Failed to send reply: " + e.getMessage());
        }
    }
}