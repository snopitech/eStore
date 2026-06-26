package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Order;
import com.ecommerce.marketplace_api.model.OrderItem;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.SellerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrder(Order order);
    
    List<OrderItem> findBySeller(SellerProfile seller);
    
    List<OrderItem> findByProduct(Product product);
    
    List<OrderItem> findByOrderAndProduct(Order order, Product product);
}