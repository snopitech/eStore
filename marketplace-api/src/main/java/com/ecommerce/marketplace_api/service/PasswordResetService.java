package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.PasswordResetToken;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.PasswordResetTokenRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;

    public PasswordResetService(UserRepository userRepository, PasswordResetTokenRepository tokenRepository) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
    }

    // Generate reset token for a user
    @Transactional
    public String createResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Delete any existing tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate new token
        String tokenValue = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

        PasswordResetToken resetToken = new PasswordResetToken(tokenValue, user, expiryDate);
        tokenRepository.save(resetToken);

        // Also store in user table for quick lookup
        user.setResetToken(tokenValue);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);

        return tokenValue;
    }

    // Validate reset token
    public User validateResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token has already been used");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("Token has expired");
        }

        return resetToken.getUser();
    }

    // Reset password
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = validateResetToken(token);

        // Update password
        user.setPassword(newPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        // Mark token as used
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
