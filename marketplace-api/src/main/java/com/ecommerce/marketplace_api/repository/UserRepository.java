package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.model.UserType;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByUserType(UserType userType);
}