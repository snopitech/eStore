package com.ecommerce.marketplace_api.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    // In-memory storage for messages (replace with database later)
    private static final List<ChatMessage> messages = new ArrayList<>();
    private static final int MAX_MESSAGES = 100;

    @PostMapping("/send")
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        synchronized (messages) {
            messages.add(message);
            // Keep only last 100 messages
            if (messages.size() > MAX_MESSAGES) {
                messages.remove(0);
            }
        }
        return message;
    }

    @GetMapping("/messages")
    public List<ChatMessage> getMessages() {
        synchronized (messages) {
            // Return last 50 messages
            int start = Math.max(0, messages.size() - 50);
            return new ArrayList<>(messages.subList(start, messages.size()));
        }
    }
}

class ChatMessage {
    private String id;
    private String user;
    private String text;
    private String time;
    private boolean isSeller;
    private LocalDateTime timestamp;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
    
    public boolean isSeller() { return isSeller; }
    public void setSeller(boolean seller) { isSeller = seller; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}