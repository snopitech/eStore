package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Order;
import com.ecommerce.marketplace_api.model.OrderStatus;
import com.ecommerce.marketplace_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyer(User buyer);
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByPaymentIntentId(String paymentIntentId);
    long countByStatus(OrderStatus status);
}