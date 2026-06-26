package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Commission;
import com.ecommerce.marketplace_api.model.Order;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CommissionRepository extends JpaRepository<Commission, Long> {

    List<Commission> findByOrder(Order order);

    List<Commission> findBySeller(User seller);

    List<Commission> findBySellerAndStatus(User seller, String status);

    Optional<Commission> findByOrderAndProduct(Order order, Product product);

    @Query("SELECT SUM(c.commissionAmount) FROM Commission c WHERE c.seller = :seller AND c.status = 'PENDING'")
    BigDecimal sumPendingCommissionBySeller(@Param("seller") User seller);

    @Query("SELECT SUM(c.commissionAmount) FROM Commission c WHERE c.seller = :seller AND c.status = 'PAID'")
    BigDecimal sumPaidCommissionBySeller(@Param("seller") User seller);

    @Query("SELECT SUM(c.commissionAmount) FROM Commission c WHERE c.seller = :seller")
    BigDecimal sumTotalCommissionBySeller(@Param("seller") User seller);

    @Query("SELECT COUNT(c) FROM Commission c WHERE c.seller = :seller AND c.status = 'PENDING'")
    long countPendingCommissionsBySeller(@Param("seller") User seller);

    @Query("SELECT SUM(c.commissionAmount) FROM Commission c WHERE c.marketplace = :marketplace AND c.status = 'PENDING'")
    BigDecimal sumPendingCommissionByMarketplace(@Param("marketplace") String marketplace);

    List<Commission> findByStatus(String status);
}