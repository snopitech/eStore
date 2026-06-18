package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.ProductRequest;
import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.model.*;
import com.ecommerce.marketplace_api.repository.CategoryRepository;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.SellerProfileRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    
    private final ProductRepository productRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, SellerProfileRepository sellerProfileRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.sellerProfileRepository = sellerProfileRepository;
        this.categoryRepository = categoryRepository;
    }
    
    public ProductResponse createProduct(Long userId, ProductRequest request) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
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
        
        if (request.getStatus() != null && request.getStatus().equals("ACTIVE")) {
            product.setStatus(ProductStatus.ACTIVE);
            product.setPublishedAt(LocalDateTime.now());
        } else {
            product.setStatus(ProductStatus.DRAFT);
        }
        
        Product saved = productRepository.save(product);
        
        seller.setTotalProducts(seller.getTotalProducts() + 1);
        sellerProfileRepository.save(seller);
        
        return convertToResponse(saved);
    }
    
    public List<ProductResponse> getSellerProducts(Long userId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        return productRepository.findBySeller(seller).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public List<ProductResponse> getAllActiveProducts() {
        return productRepository.findByStatus(ProductStatus.ACTIVE).stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }
    
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToResponse(product);
    }
    
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
            .filter(p -> p.getStatus() == ProductStatus.ACTIVE)
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    public ProductResponse updateProduct(Long userId, Long productId, ProductRequest request) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
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
        
        if (request.getStatus() != null && request.getStatus().equals("ACTIVE")) {
            product.setStatus(ProductStatus.ACTIVE);
            if (product.getPublishedAt() == null) {
                product.setPublishedAt(LocalDateTime.now());
            }
        } else {
            product.setStatus(ProductStatus.DRAFT);
        }
        
        Product updated = productRepository.save(product);
        return convertToResponse(updated);
    }
    
    public void deleteProduct(Long userId, Long productId) {
        SellerProfile seller = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("You don't own this product");
        }
        
        productRepository.delete(product);
        
        seller.setTotalProducts(seller.getTotalProducts() - 1);
        sellerProfileRepository.save(seller);
    }
    
    private ProductResponse convertToResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getSlug(),
            product.getDescription(),
            product.getShortDescription(),
            product.getPrice(),
            product.getCompareAtPrice(),
            product.getQuantity(),
            product.getSku(),
            product.getCategory() != null ? product.getCategory().getId() : null,
            product.getCategory() != null ? product.getCategory().getName() : null,
            product.getSeller().getId(),
            product.getSeller().getStoreName(),
            product.getImages(),
            product.getSpecifications(),
            product.getStatus().name(),
            product.getViewsCount(),
            product.getSalesCount(),
            product.getRating(),
            product.getCreatedAt()
        );
    }
}