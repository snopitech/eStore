package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.CartItem;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUser(User user);
}