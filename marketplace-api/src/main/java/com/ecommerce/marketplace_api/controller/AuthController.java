package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.RegisterRequest;
import com.ecommerce.marketplace_api.dto.AuthResponse;
import com.ecommerce.marketplace_api.dto.LoginRequest;
import com.ecommerce.marketplace_api.dto.LoginResponse;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {
    
    private final UserService userService;
    private final JwtUtil jwtUtil;

    AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }
    
    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        try {
            Long userId = userService.registerUser(request);
            return new AuthResponse("User registered successfully", userId);
        } catch (RuntimeException e) {
            return new AuthResponse(e.getMessage(), null);
        }
    }
    
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        try {
            System.out.println("=== LOGIN ATTEMPT ===");
            System.out.println("Email: " + request.getEmail());
            
            User user = userService.loginUser(request.getEmail(), request.getPassword());
            System.out.println("User found: " + user.getEmail());
            System.out.println("User type: " + user.getUserType());
            System.out.println("First name: " + user.getFirstName());
            System.out.println("Last name: " + user.getLastName());
            
            String token = jwtUtil.generateToken(user.getEmail());
            System.out.println("Token generated: " + token);
            
            return new LoginResponse(
                token,
                user.getEmail(),
                user.getUserType().name(),
                user.getFirstName(),
                user.getLastName()
            );
        } catch (RuntimeException e) {
            System.err.println("Login error: " + e.getMessage());
            return new LoginResponse(null, null, null);
        }
    }
}