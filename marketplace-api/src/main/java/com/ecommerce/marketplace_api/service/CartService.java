package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.CartItemRequest;
import com.ecommerce.marketplace_api.dto.CartItemResponse;
import com.ecommerce.marketplace_api.model.CartItem;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.CartItemRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    
    private final ProductRepository productRepository;
    
    private final UserRepository userRepository;

    CartService(CartItemRepository cartItemRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }
    
    public CartItemResponse addToCart(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (product.getQuantity() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }
        
        // Check if product already in cart
        CartItem existingItem = cartItemRepository.findByUserAndProduct(user, product).orElse(null);
        
        if (existingItem != null) {
            // Update quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (product.getQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
            return convertToResponse(existingItem);
        } else {
            // Create new cart item
            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setPriceAtAdd(product.getPrice());
            
            CartItem saved = cartItemRepository.save(cartItem);
            return convertToResponse(saved);
        }
    }
    
    public List<CartItemResponse> getCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return cartItemRepository.findByUser(user).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public CartItemResponse updateCartItemQuantity(Long userId, Long itemId, Integer quantity) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't own this cart item");
        }
        
        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }
        
        Product product = cartItem.getProduct();
        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        cartItem.setQuantity(quantity);
        CartItem saved = cartItemRepository.save(cartItem);
        return convertToResponse(saved);
    }
    
    public void removeFromCart(Long userId, Long itemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't own this cart item");
        }
        
        cartItemRepository.delete(cartItem);
    }
    
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        cartItemRepository.deleteByUser(user);
    }
    
    private CartItemResponse convertToResponse(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal subtotal = cartItem.getPriceAtAdd().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        
        // Get first image from JSON array if exists
        String productImage = null;
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            try {
                // Simple extraction - assumes images is a JSON array like ["url1","url2"]
                String images = product.getImages();
                if (images.contains("\"")) {
                    productImage = images.split("\"")[1];
                }
            } catch (Exception e) {
                productImage = null;
            }
        }
        
        return new CartItemResponse(
            cartItem.getId(),
            product.getId(),
            product.getName(),
            product.getSlug(),
            productImage,
            cartItem.getQuantity(),
            cartItem.getPriceAtAdd(),
            subtotal,
            product.getSeller().getId(),
            product.getSeller().getStoreName()
        );
    }
}
