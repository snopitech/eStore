package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.model.Order;
import com.ecommerce.marketplace_api.model.OrderStatus;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.ProductStatus;
import com.ecommerce.marketplace_api.model.User;
import com.ecommerce.marketplace_api.repository.CommissionRepository;
import com.ecommerce.marketplace_api.repository.OrderRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CommissionRepository commissionRepository;

    public AnalyticsService(OrderRepository orderRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository,
                            CommissionRepository commissionRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.commissionRepository = commissionRepository;
    }

    // ===== 1. SALES OVERVIEW =====
    public Map<String, Object> getSalesOverview() {
        List<Order> orders = orderRepository.findAll();
        List<Order> paidOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        long totalOrders = paidOrders.size();
        BigDecimal totalRevenue = paidOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = totalOrders > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // This month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        List<Order> thisMonthOrders = paidOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfMonth))
                .collect(Collectors.toList());

        BigDecimal thisMonthRevenue = thisMonthOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Last month
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfMonth.minusSeconds(1);
        List<Order> lastMonthOrders = paidOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(startOfLastMonth) && o.getCreatedAt().isBefore(endOfLastMonth))
                .collect(Collectors.toList());

        BigDecimal lastMonthRevenue = lastMonthOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate growth
        double growth = 0;
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = thisMonthRevenue.subtract(lastMonthRevenue)
                    .divide(lastMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalOrders", totalOrders);
        response.put("totalRevenue", totalRevenue);
        response.put("averageOrderValue", averageOrderValue);
        response.put("thisMonthRevenue", thisMonthRevenue);
        response.put("lastMonthRevenue", lastMonthRevenue);
        response.put("growth", Math.round(growth * 100.0) / 100.0);

        return response;
    }

    // ===== 2. REVENUE OVER TIME =====
    public Map<String, Object> getRevenueOverTime(String period) {
        List<Order> paidOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        Map<String, BigDecimal> revenueByDate = new LinkedHashMap<>();
        Map<String, Long> ordersByDate = new LinkedHashMap<>();
        Map<String, Integer> days = new LinkedHashMap<>();

        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        switch (period.toLowerCase()) {
            case "week":
                startDate = endDate.minusDays(7);
                break;
            case "month":
                startDate = endDate.minusDays(30);
                break;
            case "year":
                startDate = endDate.minusDays(365);
                break;
            default:
                startDate = endDate.minusDays(30);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        // Initialize all dates with 0
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            String key = current.format(formatter);
            revenueByDate.put(key, BigDecimal.ZERO);
            ordersByDate.put(key, 0L);
            days.put(key, current.getDayOfMonth());
            current = current.plusDays(1);
        }

        // Populate with actual data
        for (Order order : paidOrders) {
            LocalDate orderDate = order.getCreatedAt().toLocalDate();
            if (!orderDate.isBefore(startDate) && !orderDate.isAfter(endDate)) {
                String key = orderDate.format(formatter);
                revenueByDate.merge(key, order.getTotalAmount(), BigDecimal::add);
                ordersByDate.merge(key, 1L, Long::sum);
            }
        }

        // Build chart data
        List<String> labels = new ArrayList<>(revenueByDate.keySet());
        List<Double> revenueData = revenueByDate.values().stream()
                .map(BigDecimal::doubleValue)
                .collect(Collectors.toList());
        List<Long> orderData = new ArrayList<>(ordersByDate.values());

        Map<String, Object> response = new HashMap<>();
        response.put("labels", labels);
        response.put("revenue", revenueData);
        response.put("orders", orderData);
        response.put("period", period);

        return response;
    }

    // ===== 3. TOP PRODUCTS =====
    public List<Map<String, Object>> getTopProducts(int limit) {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .map(product -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", product.getId());
                    map.put("name", product.getName());
                    map.put("price", product.getPrice());
                    map.put("salesCount", product.getSalesCount() != null ? product.getSalesCount() : 0);
                    map.put("quantity", product.getQuantity());
                    map.put("status", product.getStatus().name());
                    map.put("storeName", product.getSeller() != null ? product.getSeller().getStoreName() : "N/A");
                    return map;
                })
                .sorted((a, b) -> Integer.compare(
                        (int) b.get("salesCount"),
                        (int) a.get("salesCount")
                ))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // ===== 4. TOP CATEGORIES =====
    public List<Map<String, Object>> getTopCategories() {
        List<Product> products = productRepository.findAll();

        Map<String, Map<String, Object>> categoryMap = new HashMap<>();

        for (Product product : products) {
            String categoryName = product.getCategory() != null ? product.getCategory().getName() : "Uncategorized";
            String categoryId = product.getCategory() != null ? product.getCategory().getId().toString() : "0";

            categoryMap.putIfAbsent(categoryId, new HashMap<>());
            Map<String, Object> cat = categoryMap.get(categoryId);
            cat.put("id", categoryId);
            cat.put("name", categoryName);
            cat.put("productCount", (int) cat.getOrDefault("productCount", 0) + 1);
            cat.put("totalSales", ((int) cat.getOrDefault("totalSales", 0)) + (product.getSalesCount() != null ? product.getSalesCount() : 0));
        }

        return new ArrayList<>(categoryMap.values()).stream()
                .sorted((a, b) -> Integer.compare((int) b.get("totalSales"), (int) a.get("totalSales")))
                .limit(10)
                .collect(Collectors.toList());
    }

    // ===== 5. SALES BY MARKETPLACE =====
    public Map<String, Object> getSalesByMarketplace() {
        List<Order> paidOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        Map<String, BigDecimal> revenueByMarketplace = new HashMap<>();
        Map<String, Long> ordersByMarketplace = new HashMap<>();

        for (Order order : paidOrders) {
            String marketplace = order.getMarketplace() != null ? order.getMarketplace() : "ESTORE";
            revenueByMarketplace.merge(marketplace, order.getTotalAmount(), BigDecimal::add);
            ordersByMarketplace.merge(marketplace, 1L, Long::sum);
        }

        List<Map<String, Object>> marketplaceData = new ArrayList<>();

        for (String marketplace : revenueByMarketplace.keySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("marketplace", marketplace);
            item.put("revenue", revenueByMarketplace.get(marketplace));
            item.put("orders", ordersByMarketplace.getOrDefault(marketplace, 0L));
            marketplaceData.add(item);
        }

        // Calculate total for percentages
        BigDecimal totalRevenue = revenueByMarketplace.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> response = new HashMap<>();
        response.put("marketplaces", marketplaceData);
        response.put("totalRevenue", totalRevenue);

        return response;
    }

    // ===== 6. COMMISSION SUMMARY =====
    public Map<String, Object> getCommissionSummary() {
        BigDecimal totalPending = commissionRepository.findAll().stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .map(c -> c.getCommissionAmount() != null ? c.getCommissionAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = commissionRepository.findAll().stream()
                .filter(c -> "PAID".equals(c.getStatus()))
                .map(c -> c.getCommissionAmount() != null ? c.getCommissionAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCommission = totalPending.add(totalPaid);

        long pendingCount = commissionRepository.findAll().stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .count();

        long paidCount = commissionRepository.findAll().stream()
                .filter(c -> "PAID".equals(c.getStatus()))
                .count();

        // Commission by marketplace
        Map<String, BigDecimal> commissionByMarketplace = new HashMap<>();
        for (var commission : commissionRepository.findAll()) {
            String marketplace = commission.getMarketplace() != null ? commission.getMarketplace() : "ESTORE";
            commissionByMarketplace.merge(marketplace,
                    commission.getCommissionAmount() != null ? commission.getCommissionAmount() : BigDecimal.ZERO,
                    BigDecimal::add);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalCommission", totalCommission);
        response.put("totalPending", totalPending);
        response.put("totalPaid", totalPaid);
        response.put("pendingCount", pendingCount);
        response.put("paidCount", paidCount);
        response.put("commissionByMarketplace", commissionByMarketplace);

        return response;
    }

    // ===== 7. CUSTOMER INSIGHTS =====
    public Map<String, Object> getCustomerInsights() {
        List<User> buyers = userRepository.findAll().stream()
                .filter(u -> u.getUserType() == null || u.getUserType() != null)
                .collect(Collectors.toList());

        long totalCustomers = buyers.size();

        // Orders by customer
        List<Order> paidOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        Map<Long, Integer> customerOrderCount = new HashMap<>();
        for (Order order : paidOrders) {
            Long buyerId = order.getBuyer().getId();
            customerOrderCount.merge(buyerId, 1, Integer::sum);
        }

        long repeatCustomers = customerOrderCount.values().stream()
                .filter(count -> count > 1)
                .count();

        double repeatRate = totalCustomers > 0
                ? (double) repeatCustomers / totalCustomers * 100
                : 0;

        Map<String, Object> response = new HashMap<>();
        response.put("totalCustomers", totalCustomers);
        response.put("repeatCustomers", repeatCustomers);
        response.put("repeatRate", Math.round(repeatRate * 100.0) / 100.0);

        return response;
    }

    // ===== 8. INVENTORY STATUS =====
    public Map<String, Object> getInventoryStatus() {
        List<Product> products = productRepository.findAll();

        long totalProducts = products.size();
        long activeProducts = products.stream()
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .count();
        long outOfStock = products.stream()
                .filter(p -> p.getQuantity() == null || p.getQuantity() <= 0)
                .count();
        long lowStock = products.stream()
                .filter(p -> p.getQuantity() != null && p.getQuantity() > 0 && p.getQuantity() <= 5)
                .count();

        // Get product count by status
        Map<String, Long> statusCount = products.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getStatus() != null ? p.getStatus().name() : "DRAFT",
                        Collectors.counting()
                ));

        Map<String, Object> response = new HashMap<>();
        response.put("totalProducts", totalProducts);
        response.put("activeProducts", activeProducts);
        response.put("outOfStock", outOfStock);
        response.put("lowStock", lowStock);
        response.put("statusCount", statusCount);

        return response;
    }
}