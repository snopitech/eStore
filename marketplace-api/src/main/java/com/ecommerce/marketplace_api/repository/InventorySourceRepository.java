package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.InventorySource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InventorySourceRepository extends JpaRepository<InventorySource, Long> {

    Optional<InventorySource> findByName(String name);

    List<InventorySource> findByIsActiveTrue();

    boolean existsByName(String name);
}