package com.ecommerce.marketplace_api.repository;

import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.ProductVariation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VariationRepository extends JpaRepository<ProductVariation, Long> {

    List<ProductVariation> findByProduct(Product product);

    List<ProductVariation> findByProductAndIsActiveTrue(Product product);

    List<ProductVariation> findByProductAndVariationType(Product product, String variationType);

    Optional<ProductVariation> findByProductAndVariationTypeAndVariationValue(Product product, String variationType, String variationValue);

    List<ProductVariation> findByProductAndVariationTypeAndIsActiveTrue(Product product, String variationType);

    boolean existsByProductAndVariationTypeAndVariationValue(Product product, String variationType, String variationValue);

    void deleteByProduct(Product product);
}