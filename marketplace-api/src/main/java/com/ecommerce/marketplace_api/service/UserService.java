package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.RegisterRequest;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@SuppressWarnings("unused")
@Service
public class UserService {
    
    private final UserRepository userRepository;

    UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public Long registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        
        if ("SELLER".equalsIgnoreCase(request.getUserType())) {
            user.setUserType(UserType.SELLER);
        } else {
            user.setUserType(UserType.BUYER);
        }
        
        User savedUser = userRepository.save(user);
        return savedUser.getId();
    }
    
    public User getUserByEmail(String email) {
    return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
}

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }
        
        return user;
    }
}