package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.MessageRequest;
import com.ecommerce.marketplace_api.dto.MessageResponse;
import com.ecommerce.marketplace_api.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
        System.out.println("=== MESSAGE CONTROLLER INITIALIZED ===");
    }

    @PostMapping("/send")
    public ResponseEntity<MessageResponse> sendMessage(@RequestBody MessageRequest request) {
        System.out.println("=== MESSAGE CONTROLLER: sendMessage CALLED ===");
        System.out.println("ProductId: " + request.getProductId());
        System.out.println("SellerId: " + request.getSellerId());
        System.out.println("Subject: " + request.getSubject());
        System.out.println("Message: " + request.getMessage());
        System.out.println("BuyerEmail: " + request.getBuyerEmail());
        System.out.println("BuyerName: " + request.getBuyerName());
        
        try {
            MessageResponse response = messageService.sendMessage(request);
            System.out.println("Response: " + response.getMessage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in sendMessage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse(false, "Failed to send message: " + e.getMessage()));
        }
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<MessageResponse>> getMessagesForSeller(@PathVariable Long sellerId) {
        System.out.println("=== GET MESSAGES FOR SELLER: " + sellerId);
        try {
            List<MessageResponse> messages = messageService.getMessagesForSeller(sellerId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error getting messages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/reply")
    public ResponseEntity<MessageResponse> replyToMessage(@RequestBody MessageRequest request) {
        System.out.println("=== MESSAGE CONTROLLER: replyToMessage CALLED ===");
        System.out.println("BuyerEmail: " + request.getBuyerEmail());
        System.out.println("Subject: " + request.getSubject());
        System.out.println("Message: " + request.getMessage());
        
        try {
            MessageResponse response = messageService.replyToMessage(request);
            System.out.println("Response: " + response.getMessage());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in replyToMessage: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse(false, "Failed to send reply: " + e.getMessage()));
        }
    }
}