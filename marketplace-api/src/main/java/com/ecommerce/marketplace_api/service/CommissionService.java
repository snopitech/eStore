package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.Commission;
import com.ecommerce.marketplace_api.model.Order;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.CommissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommissionService {

    private final CommissionRepository commissionRepository;

    // Default commission rate: 5%
    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("5.00");

    public CommissionService(CommissionRepository commissionRepository) {
        this.commissionRepository = commissionRepository;
    }

    /**
     * Calculate and create commission for a product in an order
     */
    @Transactional
    public Commission createCommission(Order order, Product product, User seller) {
        // Calculate commission (5% of product price)
        BigDecimal productPrice = product.getPrice();
        BigDecimal commissionAmount = productPrice
                .multiply(DEFAULT_COMMISSION_RATE)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        // Calculate seller payout (95% of product price)
        BigDecimal sellerPayout = productPrice.subtract(commissionAmount);

        Commission commission = new Commission();
        commission.setOrder(order);
        commission.setProduct(product);
        commission.setSeller(seller);
        commission.setCommissionRate(DEFAULT_COMMISSION_RATE);
        commission.setCommissionAmount(commissionAmount);
        commission.setSellerPayoutAmount(sellerPayout);
        commission.setMarketplace(order.getMarketplace() != null ? order.getMarketplace() : "ESTORE");
        commission.setStatus("PENDING");

        return commissionRepository.save(commission);
    }

    /**
     * Create commissions for all products in an order
     */
    @Transactional
    public List<Commission> createCommissionsForOrder(Order order, List<Product> products, User seller) {
        return products.stream()
                .map(product -> createCommission(order, product, seller))
                .toList();
    }

    /**
     * Mark commission as paid
     */
    @Transactional
    public Commission markCommissionAsPaid(Long commissionId) {
        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new RuntimeException("Commission not found"));

        commission.setStatus("PAID");
        commission.setPaidAt(LocalDateTime.now());
        return commissionRepository.save(commission);
    }

    /**
     * Mark all commissions for an order as paid
     */
    @Transactional
    public List<Commission> markOrderCommissionsAsPaid(Long orderId) {
        // We need to find commissions by order
        // This will be implemented when we add the method to find by order
        return null;
    }

    /**
     * Get all commissions for a seller
     */
    public List<Commission> getCommissionsBySeller(User seller) {
        return commissionRepository.findBySeller(seller);
    }

    /**
     * Get pending commissions for a seller
     */
    public List<Commission> getPendingCommissionsBySeller(User seller) {
        return commissionRepository.findBySellerAndStatus(seller, "PENDING");
    }

    /**
     * Get total pending commission amount for a seller
     */
    public BigDecimal getTotalPendingCommission(User seller) {
        BigDecimal total = commissionRepository.sumPendingCommissionBySeller(seller);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Get total paid commission amount for a seller
     */
    public BigDecimal getTotalPaidCommission(User seller) {
        BigDecimal total = commissionRepository.sumPaidCommissionBySeller(seller);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Get total commission amount for a seller
     */
    public BigDecimal getTotalCommission(User seller) {
        BigDecimal total = commissionRepository.sumTotalCommissionBySeller(seller);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Count pending commissions for a seller
     */
    public long countPendingCommissions(User seller) {
        return commissionRepository.countPendingCommissionsBySeller(seller);
    }

    /**
     * Get commission by order and product
     */
    public Commission getCommissionByOrderAndProduct(Order order, Product product) {
        return commissionRepository.findByOrderAndProduct(order, product)
                .orElseThrow(() -> new RuntimeException("Commission not found"));
    }

    /**
     * Get all commissions with status PENDING
     */
    public List<Commission> getAllPendingCommissions() {
        return commissionRepository.findByStatus("PENDING");
    }

    /**
     * Process payouts for a seller (mark all pending commissions as paid)
     */
    @Transactional
    public List<Commission> processPayoutForSeller(User seller) {
        List<Commission> pendingCommissions = commissionRepository.findBySellerAndStatus(seller, "PENDING");

        for (Commission commission : pendingCommissions) {
            commission.setStatus("PAID");
            commission.setPaidAt(LocalDateTime.now());
        }

        return commissionRepository.saveAll(pendingCommissions);
    }

    /**
     * Calculate commission for a given price
     */
    public BigDecimal calculateCommission(BigDecimal price) {
        return price
                .multiply(DEFAULT_COMMISSION_RATE)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate seller payout for a given price
     */
    public BigDecimal calculateSellerPayout(BigDecimal price) {
        return price.subtract(calculateCommission(price));
    }

    /**
     * Get total pending commission by marketplace
     */
    public BigDecimal getPendingCommissionByMarketplace(String marketplace) {
        BigDecimal total = commissionRepository.sumPendingCommissionByMarketplace(marketplace);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Check if a seller has pending payouts
     */
    public boolean hasPendingPayouts(User seller) {
        return countPendingCommissions(seller) > 0;
    }
}