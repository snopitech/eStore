/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-useless-assignment */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8087/api';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [condition, setCondition] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [auctionOnly, setAuctionOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (condition) params.append('condition', condition);
      if (brand) params.append('brand', brand);
      if (color) params.append('color', color);
      if (sortBy) params.append('sortBy', sortBy);
      if (inStockOnly) params.append('inStock', true);
      if (auctionOnly) params.append('isAuction', true);

      const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('newest');
    setCondition('');
    setBrand('');
    setColor('');
    setInStockOnly(false);
    setAuctionOnly(false);
    setTimeout(fetchProducts, 100);
  };

  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    const success = await addToCart(productId, 1);
    if (success) {
      alert('Added to cart!');
    }
  };

  const isInStock = (product) => {
    return product.quantity !== undefined && product.quantity > 0;
  };

  const getConditionLabel = (condition) => {
    const labels = {
      'NEW': '🆕 New',
      'LIKE_NEW': '✨ Like New',
      'EXCELLENT': '⭐ Excellent',
      'GOOD': '👍 Good',
      'ACCEPTABLE': '👌 Acceptable',
      'REFURBISHED': '🔧 Refurbished'
    };
    return labels[condition] || condition;
  };

  const getConditionColor = (condition) => {
    const colors = {
      'NEW': 'bg-green-100 text-green-800',
      'LIKE_NEW': 'bg-blue-100 text-blue-800',
      'EXCELLENT': 'bg-purple-100 text-purple-800',
      'GOOD': 'bg-yellow-100 text-yellow-800',
      'ACCEPTABLE': 'bg-orange-100 text-orange-800',
      'REFURBISHED': 'bg-gray-100 text-gray-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const getPlaceholderSvg = () => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading search results...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Search Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">{products.length} results found</p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full bg-white rounded-lg shadow p-3 mb-4 flex items-center justify-between"
        >
          <span className="font-medium">🔍 Filters</span>
          <span>{showFilters ? '▲' : '▼'}</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Filters */}
          <div className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow p-4 sticky top-20">
              <h3 className="font-semibold text-base sm:text-lg mb-3">🔍 Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm min-h-[44px]"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(c => !c.parent).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 border rounded px-3 py-2 text-sm min-h-[44px]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 border rounded px-3 py-2 text-sm min-h-[44px]"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm min-h-[44px]"
                >
                  <option value="">All Conditions</option>
                  <option value="NEW">🆕 New</option>
                  <option value="LIKE_NEW">✨ Like New</option>
                  <option value="EXCELLENT">⭐ Excellent</option>
                  <option value="GOOD">👍 Good</option>
                  <option value="ACCEPTABLE">👌 Acceptable</option>
                  <option value="REFURBISHED">🔧 Refurbished</option>
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Brand name"
                  className="w-full border rounded px-3 py-2 text-sm min-h-[44px]"
                />
              </div>

              {/* Color Filter */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Color"
                  className="w-full border rounded px-3 py-2 text-sm min-h-[44px]"
                />
              </div>

              {/* Sort By */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm min-h-[44px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Checkbox Filters */}
              <div className="mb-4 space-y-2">
                <label className="flex items-center gap-2 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  In Stock Only
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={auctionOnly}
                    onChange={(e) => setAuctionOnly(e.target.checked)}
                  />
                  Auctions Only
                </label>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 min-h-[44px]"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-400 min-h-[44px]"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid - Wider */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-base sm:text-lg font-medium mb-2">No products found</h3>
                <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                {products.map((product) => {
                  let productImage = null;
                  try {
                    const images = product.images ? JSON.parse(product.images) : [];
                    productImage = images[0];
                  } catch (e) {
                    productImage = null;
                  }

                  const inStock = isInStock(product);

                  return (
                    <Link
                      to={`/product/${product.id}`}
                      key={product.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition group relative"
                    >
                      {/* Condition Badge */}
                      {product.productCondition && (
                        <div className={`absolute top-1 left-1 sm:top-2 sm:left-2 z-10 text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getConditionColor(product.productCondition)}`}>
                          {getConditionLabel(product.productCondition)}
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                        {inStock ? (
                          <span className="bg-green-600 text-white text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            In Stock
                          </span>
                        ) : (
                          <span className="bg-red-600 text-white text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            Out
                          </span>
                        )}
                      </div>

                      {/* Auction Badge */}
                      {product.isAuction && (
                        <div className="absolute top-10 left-1 sm:top-14 sm:left-2 z-10 bg-yellow-500 text-white text-[6px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full">
                          🔥 Auction
                        </div>
                      )}

                      <div className="h-32 sm:h-40 bg-gray-100 rounded-t-lg flex items-center justify-center p-2 sm:p-3">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getPlaceholderSvg();
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2 sm:p-3">
                        {product.brand && (
                          <p className="text-[8px] sm:text-xs text-gray-500">{product.brand}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-yellow-500">
                          <span>★</span>
                          <span className="text-gray-600 text-[10px] sm:text-sm">{product.rating || 0}</span>
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-2 group-hover:text-blue-600">
                          {product.name}
                        </h3>
                        <div className="text-sm sm:text-lg font-bold text-gray-900 mt-0.5 sm:mt-1">
                          {product.isAuction && product.currentBid ? (
                            <>
                              Current Bid: ${product.currentBid}
                              {product.startingBid && (
                                <span className="text-[8px] sm:text-xs text-gray-400 block">Start: ${product.startingBid}</span>
                              )}
                            </>
                          ) : (
                            `$${product.price}`
                          )}
                        </div>
                        {inStock && (
                          <div className="text-[8px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">
                            {product.quantity} available
                          </div>
                        )}
                        <button
                          onClick={(e) => handleAddToCart(product.id, e)}
                          disabled={!inStock}
                          className={`w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1.5 rounded text-[8px] sm:text-sm min-h-[32px] sm:min-h-[44px] ${
                            inStock
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;