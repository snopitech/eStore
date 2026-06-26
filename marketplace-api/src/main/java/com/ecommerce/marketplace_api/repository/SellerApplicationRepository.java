package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.SellerApplication;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SellerApplicationRepository extends JpaRepository<SellerApplication, Long> {
    Optional<SellerApplication> findByUser(User user);
    List<SellerApplication> findByStatus(ApplicationStatus status);
}