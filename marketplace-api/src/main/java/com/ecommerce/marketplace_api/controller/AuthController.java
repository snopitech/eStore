package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.RegisterRequest;
import com.ecommerce.marketplace_api.dto.AuthResponse;
import com.ecommerce.marketplace_api.dto.LoginRequest;
import com.ecommerce.marketplace_api.dto.LoginResponse;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.service.UserService;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/auth")
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
            User user = userService.loginUser(request.getEmail(), request.getPassword());
            String token = jwtUtil.generateToken(user.getEmail());
            return new LoginResponse(token, user.getEmail(), user.getUserType().name());
        } catch (RuntimeException e) {
            return new LoginResponse(null, null, null);
        }
    }
}