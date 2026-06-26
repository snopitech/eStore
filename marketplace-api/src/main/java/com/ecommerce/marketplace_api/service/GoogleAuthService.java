package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.LoginResponse;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.utils.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@SuppressWarnings("unused")
@Service
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    GoogleAuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // ===== GOOGLE LOGIN =====
    public LoginResponse authenticateGoogleUser(String idTokenString) throws Exception {
        System.out.println("=== GOOGLE LOGIN ATTEMPT ===");
        System.out.println("Google Client ID: " + googleClientId);

        // Verify Google token
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), 
                new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            System.err.println("Invalid Google token - idToken is null");
            throw new Exception("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");
        String picture = (String) payload.get("picture");

        System.out.println("Google User Email: " + email);
        System.out.println("Google User First Name: " + firstName);
        System.out.println("Google User Last Name: " + lastName);

        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            System.out.println("Existing user found: " + user.getEmail());
            System.out.println("User first name in DB: " + user.getFirstName());
            System.out.println("User last name in DB: " + user.getLastName());
        } else {
            // Create new user
            user = new User();
            user.setEmail(email);
            user.setFirstName(firstName != null ? firstName : "Google");
            user.setLastName(lastName != null ? lastName : "User");
            user.setUserType(UserType.BUYER);
            user.setPassword(""); // Google users don't need password
            user = userRepository.save(user);
            System.out.println("New user created: " + user.getEmail());
            System.out.println("User first name set to: " + user.getFirstName());
            System.out.println("User last name set to: " + user.getLastName());
        }

        // Generate JWT token
        String jwtToken = jwtUtil.generateToken(user.getEmail());
        System.out.println("JWT Token generated for: " + user.getEmail());

        // Return with firstName and lastName
        return new LoginResponse(
            jwtToken,
            user.getEmail(),
            user.getUserType().name(),
            user.getFirstName(),
            user.getLastName()
        );
    }

    // ===== GOOGLE REGISTRATION =====
    public String registerGoogleUser(String idTokenString, String userType) throws Exception {
        System.out.println("=== GOOGLE REGISTRATION ATTEMPT ===");
        System.out.println("Google Client ID: " + googleClientId);
        System.out.println("UserType requested: " + userType);

        // Verify Google token
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), 
                new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            System.err.println("Invalid Google token - idToken is null");
            throw new Exception("Invalid Google token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");

        System.out.println("Google User Email: " + email);
        System.out.println("Google User First Name: " + firstName);
        System.out.println("Google User Last Name: " + lastName);

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            System.err.println("User already exists: " + email);
            throw new Exception("User with this email already exists. Please login.");
        }

        // Create new user with Google data
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName != null ? firstName : "Google");
        user.setLastName(lastName != null ? lastName : "User");
        user.setPassword(""); // Google users don't need password
        
        // Set user type
        if (userType != null && userType.equalsIgnoreCase("SELLER")) {
            user.setUserType(UserType.SELLER);
            System.out.println("User type set to SELLER");
        } else {
            user.setUserType(UserType.BUYER);
            System.out.println("User type set to BUYER");
        }
        
        userRepository.save(user);
        System.out.println("New user registered: " + user.getEmail());
        System.out.println("User first name: " + user.getFirstName());
        System.out.println("User last name: " + user.getLastName());

        return "Google registration successful. Please login.";
    }
}