package com.ecommerce.marketplace_api.service;

import com.ecommerce.marketplace_api.dto.SearchFilters;
import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.model.Product;
import com.ecommerce.marketplace_api.model.ProductStatus;
import com.ecommerce.marketplace_api.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@Service
public class SearchService {

    private final ProductRepository productRepository;

    public SearchService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Advanced search with filters
     */
    public Page<ProductResponse> advancedSearch(SearchFilters filters) {
        // Get all active products
        List<Product> allProducts = productRepository.findByStatus(ProductStatus.ACTIVE);
        
        // Apply filters
        List<Product> filteredProducts = applyFilters(allProducts, filters);
        
        // Apply sorting
        filteredProducts = applySorting(filteredProducts, filters);
        
        // Apply pagination
        int page = filters.getPage() != null ? filters.getPage() : 0;
        int size = filters.getSize() != null ? filters.getSize() : 20;
        int start = page * size;
        int end = Math.min(start + size, filteredProducts.size());
        
        List<Product> pagedProducts = filteredProducts.subList(
            Math.min(start, filteredProducts.size()), 
            end
        );
        
        // Convert to response
        List<ProductResponse> responses = pagedProducts.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, PageRequest.of(page, size), filteredProducts.size());
    }

    /**
     * Apply all filters to the product list
     */
    private List<Product> applyFilters(List<Product> products, SearchFilters filters) {
        return products.stream()
                .filter(product -> applySearchQuery(product, filters))
                .filter(product -> applyCategoryFilter(product, filters))
                .filter(product -> applyPriceFilter(product, filters))
                .filter(product -> applyConditionFilter(product, filters))
                .filter(product -> applyBrandFilter(product, filters))
                .filter(product -> applyColorFilter(product, filters))
                .filter(product -> applyStockFilter(product, filters))
                .filter(product -> applyAuctionFilter(product, filters))
                .collect(Collectors.toList());
    }

    private boolean applySearchQuery(Product product, SearchFilters filters) {
        if (filters.getQuery() == null || filters.getQuery().isEmpty()) {
            return true;
        }
        String query = filters.getQuery().toLowerCase();
        return (product.getName() != null && product.getName().toLowerCase().contains(query)) ||
               (product.getDescription() != null && product.getDescription().toLowerCase().contains(query)) ||
               (product.getBrand() != null && product.getBrand().toLowerCase().contains(query));
    }

    private boolean applyCategoryFilter(Product product, SearchFilters filters) {
        if (filters.getCategoryId() == null) {
            return true;
        }
        return product.getCategory() != null && 
               product.getCategory().getId().equals(filters.getCategoryId());
    }

    private boolean applyPriceFilter(Product product, SearchFilters filters) {
        if (filters.getMinPrice() == null && filters.getMaxPrice() == null) {
            return true;
        }
        BigDecimal price = product.getPrice();
        if (filters.getMinPrice() != null && price.compareTo(filters.getMinPrice()) < 0) {
            return false;
        }
        if (filters.getMaxPrice() != null && price.compareTo(filters.getMaxPrice()) > 0) {
            return false;
        }
        return true;
    }

    private boolean applyConditionFilter(Product product, SearchFilters filters) {
        if (filters.getCondition() == null || filters.getCondition().isEmpty()) {
            return true;
        }
        return product.getProductCondition() != null && 
               product.getProductCondition().equalsIgnoreCase(filters.getCondition());
    }

    private boolean applyBrandFilter(Product product, SearchFilters filters) {
        if (filters.getBrand() == null || filters.getBrand().isEmpty()) {
            return true;
        }
        return product.getBrand() != null && 
               product.getBrand().equalsIgnoreCase(filters.getBrand());
    }

    private boolean applyColorFilter(Product product, SearchFilters filters) {
        if (filters.getColor() == null || filters.getColor().isEmpty()) {
            return true;
        }
        return product.getColor() != null && 
               product.getColor().equalsIgnoreCase(filters.getColor());
    }

    private boolean applyStockFilter(Product product, SearchFilters filters) {
        if (filters.getInStock() == null || !filters.getInStock()) {
            return true;
        }
        return product.getQuantity() != null && product.getQuantity() > 0;
    }

    private boolean applyAuctionFilter(Product product, SearchFilters filters) {
        if (filters.getIsAuction() == null || !filters.getIsAuction()) {
            return true;
        }
        return product.getIsAuction() != null && product.getIsAuction();
    }

    /**
     * Apply sorting to the product list
     */
    private List<Product> applySorting(List<Product> products, SearchFilters filters) {
        String sortBy = filters.getSortBy();
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "newest";
        }

        List<Product> sorted = new ArrayList<>(products);
        
        switch (sortBy) {
            case "price_asc":
                sorted.sort((a, b) -> a.getPrice().compareTo(b.getPrice()));
                break;
            case "price_desc":
                sorted.sort((a, b) -> b.getPrice().compareTo(a.getPrice()));
                break;
            case "newest":
                sorted.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
                break;
            case "popular":
                sorted.sort((a, b) -> {
                    int aSales = a.getSalesCount() != null ? a.getSalesCount() : 0;
                    int bSales = b.getSalesCount() != null ? b.getSalesCount() : 0;
                    return Integer.compare(bSales, aSales);
                });
                break;
            case "rating":
                sorted.sort((a, b) -> {
                    BigDecimal aRating = a.getRating() != null ? a.getRating() : BigDecimal.ZERO;
                    BigDecimal bRating = b.getRating() != null ? b.getRating() : BigDecimal.ZERO;
                    return bRating.compareTo(aRating);
                });
                break;
            default:
                sorted.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
                break;
        }
        
        return sorted;
    }

    /**
     * Convert Product to ProductResponse
     */
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

        // Search fields
        response.setProductCondition(product.getProductCondition());
        response.setBrand(product.getBrand());
        response.setModel(product.getModel());
        response.setColor(product.getColor());
        response.setWeight(product.getWeight());
        response.setDimensions(product.getDimensions());
        response.setIsAuction(product.getIsAuction());
        response.setAuctionEndTime(product.getAuctionEndTime());
        response.setStartingBid(product.getStartingBid());
        response.setCurrentBid(product.getCurrentBid());

        // Live streaming fields
        response.setIsLive(product.getIsLive());
        response.setLivePrice(product.getLivePrice());
        response.setLiveStartTime(product.getLiveStartTime());
        response.setLiveEndTime(product.getLiveEndTime());
        response.setViewerCount(product.getViewerCount());

        return response;
    }
}