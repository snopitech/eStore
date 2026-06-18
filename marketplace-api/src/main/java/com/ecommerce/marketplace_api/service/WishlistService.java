package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.Wishlist;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import com.ecommerce.marketplace_api.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@SuppressWarnings("unused")
@Service
public class WishlistService {
    
    private final WishlistRepository wishlistRepository;
    
    private final UserRepository userRepository;
    
    private final ProductRepository productRepository;

    WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }
    
    @Transactional
    public Wishlist addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if already in wishlist
        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new RuntimeException("Product already in wishlist");
        }
        
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        
        return wishlistRepository.save(wishlist);
    }
    
    public List<Wishlist> getUserWishlist(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return wishlistRepository.findByUser(user);
    }
    
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        wishlistRepository.deleteByUserAndProduct(user, product);
    }
    
    public boolean isInWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        return wishlistRepository.existsByUserAndProduct(user, product);
    }
}