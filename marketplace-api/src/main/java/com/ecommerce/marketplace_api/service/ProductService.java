package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.ProductRequest;
import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.CategoryRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    private final ProductRepository productRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, 
                          SellerProfileRepository sellerProfileRepository, 
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.categoryRepository = categoryRepository;
    }
    
    // ===== HELPER METHOD: Get and validate seller =====
    private SellerProfile getAndValidateSeller(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        if (!seller.getIsApproved()) {
            throw new RuntimeException("Your seller account is not approved. Please wait for admin approval.");
        }
        
        if (!seller.getIsActive()) {
            throw new RuntimeException("Your seller account is disabled. Please contact admin for assistance.");
        }
        
        return seller;
    }
    
    // ===== CREATE PRODUCT =====
    @Transactional
    public ProductResponse createProduct(Long userId, ProductRequest request) {
        SellerProfile seller = getAndValidateSeller(userId);
        
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }
        
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        
        Product product = new Product();
        product.setSeller(seller);
        product.setCategory(category);
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setPrice(request.getPrice());
        product.setCompareAtPrice(request.getCompareAtPrice());
        product.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        product.setSku(request.getSku());
        product.setImages(request.getImages());
        product.setSpecifications(request.getSpecifications());
        
        // FIX: Default to ACTIVE instead of DRAFT
        if (request.getStatus() != null && request.getStatus().equals("DRAFT")) {
            product.setStatus(ProductStatus.DRAFT);
        } else {
            product.setStatus(ProductStatus.ACTIVE);
            product.setPublishedAt(LocalDateTime.now());
        }
        
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        
        Product saved = productRepository.save(product);
        
        seller.setTotalProducts(seller.getTotalProducts() + 1);
        sellerProfileRepository.save(seller);
        
        return convertToResponse(saved);
    }
    
    // ===== GET SELLER PRODUCTS =====
    public List<ProductResponse> getSellerProducts(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        return productRepository.findBySeller(seller).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // ===== GET ALL ACTIVE PRODUCTS =====
    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // ===== GET PRODUCT BY ID =====
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToResponse(product);
    }
    
    // ===== GET PRODUCTS BY CATEGORY =====
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
            .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // ===== UPDATE PRODUCT =====
    @Transactional
    public ProductResponse updateProduct(Long userId, Long productId, ProductRequest request) {
        SellerProfile seller = getAndValidateSeller(userId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't own this product");
        }
        
        if (!product.getSlug().equals(request.getSlug()) && productRepository.existsBySlug(request.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }
        
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        
        product.setCategory(category);
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setShortDescription(request.getShortDescription());
        product.setPrice(request.getPrice());
        product.setCompareAtPrice(request.getCompareAtPrice());
        product.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        product.setSku(request.getSku());
        product.setImages(request.getImages());
        product.setSpecifications(request.getSpecifications());
        
        // FIX: Default to ACTIVE for updates too
        if (request.getStatus() != null && request.getStatus().equals("DRAFT")) {
            product.setStatus(ProductStatus.DRAFT);
        } else {
            product.setStatus(ProductStatus.ACTIVE);
            if (product.getPublishedAt() == null) {
                product.setPublishedAt(LocalDateTime.now());
            }
        }
        
        product.setUpdatedAt(LocalDateTime.now());
        
        Product updated = productRepository.save(product);
        return convertToResponse(updated);
    }
    
    // ===== DELETE PRODUCT =====
    @Transactional
    public void deleteProduct(Long userId, Long productId) {
        SellerProfile seller = getAndValidateSeller(userId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't own this product");
        }
        
        productRepository.delete(product);
        
        seller.setTotalProducts(Math.max(0, seller.getTotalProducts() - 1));
        sellerProfileRepository.save(seller);
    }
    
    // ===== GET PRODUCTS BY SELLER =====
    public List<ProductResponse> getProductsBySeller(SellerProfile seller) {
        return productRepository.findBySeller(seller).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    // ===== GET PRODUCT BY SELLER AND ID =====
    public ProductResponse getProductBySellerAndId(SellerProfile seller, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't own this product");
        }
        
        return convertToResponse(product);
    }
    
    // ===== LIVE STREAMING METHODS =====
    
    @Transactional
    public ProductResponse startLiveStream(Long userId, Long productId, BigDecimal livePrice) {
        SellerProfile seller = getAndValidateSeller(userId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't own this product");
        }
        
        if (product.getIsLive()) {
            throw new RuntimeException("This product is already live");
        }
        
        if (product.getQuantity() <= 0) {
            throw new RuntimeException("Cannot start live stream for out of stock product");
        }
        
        // Check if seller already has a live product
        if (productRepository.countLiveProductsBySeller(seller) > 0) {
            throw new RuntimeException("You already have a live stream. Please end it first.");
        }
        
        product.setIsLive(true);
        product.setLivePrice(livePrice != null ? livePrice : product.getPrice());
        product.setLiveStartTime(LocalDateTime.now());
        product.setLiveEndTime(LocalDateTime.now().plusHours(1));
        product.setViewerCount(0);
        product.setUpdatedAt(LocalDateTime.now());
        
        Product saved = productRepository.save(product);
        return convertToResponse(saved);
    }
    
    @Transactional
    public ProductResponse endLiveStream(Long userId, Long productId) {
        SellerProfile seller = getAndValidateSeller(userId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't own this product");
        }
        
        if (!product.getIsLive()) {
            throw new RuntimeException("This product is not live");
        }
        
        product.setIsLive(false);
        product.setLiveEndTime(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());
        
        Product saved = productRepository.save(product);
        return convertToResponse(saved);
    }
    
    public List<ProductResponse> getLiveProducts() {
        return productRepository.findCurrentlyLiveProducts().stream()
                .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    public List<ProductResponse> getSellerLiveProducts(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        return productRepository.findBySellerAndIsLiveTrue(seller).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void incrementViewerCount(Long productId) {
        productRepository.incrementViewerCount(productId);
    }
    
    public long getTotalLiveViewers() {
        return productRepository.getTotalLiveViewers();
    }
    
    public boolean hasLiveStream(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        return productRepository.countLiveProductsBySeller(seller) > 0;
    }
    
    // ===== CONVERT TO RESPONSE =====
    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setShortDescription(product.getShortDescription());
        response.setPrice(product.getPrice());
        response.setCompareAtPrice(product.getCompareAtPrice());
        response.setQuantity(product.getQuantity());
        response.setSku(product.getSku());
        
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getId());
            response.setCategoryName(product.getCategory().getName());
        }
        
        if (product.getSeller() != null) {
            response.setSellerId(product.getSeller().getId());
            response.setStoreName(product.getSeller().getStoreName());
        }
        
        response.setImages(product.getImages());
        response.setSpecifications(product.getSpecifications());
        response.setStatus(product.getStatus() != null ? product.getStatus().name() : "DRAFT");
        response.setViewsCount(product.getViewsCount() != null ? product.getViewsCount() : 0);
        response.setSalesCount(product.getSalesCount() != null ? product.getSalesCount() : 0);
        response.setRating(product.getRating() != null ? product.getRating() : BigDecimal.ZERO);
        response.setCreatedAt(product.getCreatedAt());
        
        response.setIsLive(product.getIsLive());
        response.setLivePrice(product.getLivePrice());
        response.setLiveStartTime(product.getLiveStartTime());
        response.setLiveEndTime(product.getLiveEndTime());
        response.setViewerCount(product.getViewerCount());
        
        return response;
    }
}