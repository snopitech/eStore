package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.VariationRequest;
import com.ecommerce.marketplace_api.dto.VariationResponse;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.ProductVariation;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import com.ecommerce.marketplace_api.repository.VariationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VariationService {

    private final VariationRepository variationRepository;
    private final ProductRepository productRepository;

    public VariationService(VariationRepository variationRepository,
                            ProductRepository productRepository) {
        this.variationRepository = variationRepository;
        this.productRepository = productRepository;
    }

    // ===== CREATE =====
    @Transactional
    public VariationResponse createVariation(Long productId, VariationRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (variationRepository.existsByProductAndVariationTypeAndVariationValue(
                product, request.getVariationType(), request.getVariationValue())) {
            throw new RuntimeException("Variation already exists for this product");
        }

        ProductVariation variation = new ProductVariation();
        variation.setProduct(product);
        variation.setVariationType(request.getVariationType());
        variation.setVariationValue(request.getVariationValue());
        variation.setSku(request.getSku());
        variation.setPriceAdjustment(request.getPriceAdjustment() != null ? request.getPriceAdjustment() : BigDecimal.ZERO);
        variation.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        variation.setImageUrl(request.getImageUrl());
        variation.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        ProductVariation saved = variationRepository.save(variation);
        return convertToResponse(saved);
    }

    // ===== GET ALL VARIATIONS FOR A PRODUCT =====
    public List<VariationResponse> getVariationsByProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return variationRepository.findByProduct(product).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ===== GET ACTIVE VARIATIONS FOR A PRODUCT =====
    public List<VariationResponse> getActiveVariationsByProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return variationRepository.findByProductAndIsActiveTrue(product).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ===== GET VARIATIONS BY TYPE =====
    public List<VariationResponse> getVariationsByType(Long productId, String variationType) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return variationRepository.findByProductAndVariationType(product, variationType).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ===== GET VARIATION BY ID =====
    public VariationResponse getVariationById(Long variationId) {
        ProductVariation variation = variationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variation not found"));
        return convertToResponse(variation);
    }

    // ===== UPDATE =====
    @Transactional
    public VariationResponse updateVariation(Long variationId, VariationRequest request) {
        ProductVariation variation = variationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variation not found"));

        variation.setVariationType(request.getVariationType());
        variation.setVariationValue(request.getVariationValue());
        variation.setSku(request.getSku());
        variation.setPriceAdjustment(request.getPriceAdjustment() != null ? request.getPriceAdjustment() : BigDecimal.ZERO);
        variation.setQuantity(request.getQuantity() != null ? request.getQuantity() : 0);
        variation.setImageUrl(request.getImageUrl());
        variation.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        ProductVariation updated = variationRepository.save(variation);
        return convertToResponse(updated);
    }

    // ===== DELETE =====
    @Transactional
    public void deleteVariation(Long variationId) {
        ProductVariation variation = variationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variation not found"));
        variationRepository.delete(variation);
    }

    // ===== DELETE ALL VARIATIONS FOR A PRODUCT =====
    @Transactional
    public void deleteAllVariations(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        variationRepository.deleteByProduct(product);
    }

    // ===== CHECK STOCK =====
    public boolean isVariationInStock(Long variationId) {
        ProductVariation variation = variationRepository.findById(variationId)
                .orElseThrow(() -> new RuntimeException("Variation not found"));
        return variation.getQuantity() != null && variation.getQuantity() > 0 && variation.getIsActive();
    }

    // ===== CONVERT TO RESPONSE =====
    private VariationResponse convertToResponse(ProductVariation variation) {
        return new VariationResponse(
                variation.getId(),
                variation.getProduct().getId(),
                variation.getVariationType(),
                variation.getVariationValue(),
                variation.getSku(),
                variation.getPriceAdjustment(),
                variation.getQuantity(),
                variation.getImageUrl(),
                variation.getIsActive(),
                variation.getCreatedAt(),
                variation.getUpdatedAt()
        );
    }
}