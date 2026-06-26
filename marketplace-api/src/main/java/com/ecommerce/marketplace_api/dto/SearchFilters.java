package com.ecommerce.marketplace_api.dto;

import java.math.BigDecimal;
import java.util.List;

public class SearchFilters {
    private String query;
    private Long categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String condition;
    private String brand;
    private String color;
    private String sortBy;
    private Integer page = 0;
    private Integer size = 20;
    private List<Long> sellerIds;
    private Boolean inStock;
    private Boolean isAuction;

    public SearchFilters() {}

    // Getters and setters
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }

    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }

    public List<Long> getSellerIds() { return sellerIds; }
    public void setSellerIds(List<Long> sellerIds) { this.sellerIds = sellerIds; }

    public Boolean getInStock() { return inStock; }
    public void setInStock(Boolean inStock) { this.inStock = inStock; }

    public Boolean getIsAuction() { return isAuction; }
    public void setIsAuction(Boolean isAuction) { this.isAuction = isAuction; }
}