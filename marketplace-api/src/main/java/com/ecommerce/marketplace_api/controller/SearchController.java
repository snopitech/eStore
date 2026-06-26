package com.ecommerce.marketplace_api.controller;

import com.ecommerce.marketplace_api.dto.SearchFilters;
import com.ecommerce.marketplace_api.dto.ProductResponse;
import com.ecommerce.marketplace_api.service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * Advanced search with filters
     * GET /api/search?query=iphone&minPrice=100&maxPrice=1000&sortBy=price_asc&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<?> advancedSearch(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Boolean isAuction) {

        try {
            // Build filters
            SearchFilters filters = new SearchFilters();
            filters.setQuery(query);
            filters.setCategoryId(categoryId);
            filters.setMinPrice(minPrice != null ? java.math.BigDecimal.valueOf(minPrice) : null);
            filters.setMaxPrice(maxPrice != null ? java.math.BigDecimal.valueOf(maxPrice) : null);
            filters.setCondition(condition);
            filters.setBrand(brand);
            filters.setColor(color);
            filters.setSortBy(sortBy);
            filters.setPage(page);
            filters.setSize(size);
            filters.setInStock(inStock);
            filters.setIsAuction(isAuction);

            // Execute search
            Page<ProductResponse> result = searchService.advancedSearch(filters);

            Map<String, Object> response = new HashMap<>();
            response.put("products", result.getContent());
            response.put("totalItems", result.getTotalElements());
            response.put("totalPages", result.getTotalPages());
            response.put("currentPage", result.getNumber());
            response.put("pageSize", result.getSize());
            response.put("hasNext", result.hasNext());
            response.put("hasPrevious", result.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Search error: " + e.getMessage());
        }
    }

    /**
     * Get available filter options (brands, colors, conditions)
     * GET /api/search/filters
     */
    @GetMapping("/filters")
    public ResponseEntity<?> getFilterOptions() {
        try {
            // For now, return static options
            // In the future, you can fetch these from the database
            Map<String, Object> filters = new HashMap<>();
            
            filters.put("conditions", new String[]{
                "NEW", "LIKE_NEW", "EXCELLENT", "GOOD", "ACCEPTABLE", "REFURBISHED"
            });
            
            filters.put("sortOptions", new String[]{
                "newest", "price_asc", "price_desc", "popular", "rating"
            });

            return ResponseEntity.ok(filters);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching filter options: " + e.getMessage());
        }
    }
}