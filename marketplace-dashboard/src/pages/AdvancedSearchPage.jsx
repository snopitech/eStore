/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://estore.snopitech.com/api';

function AdvancedSearchPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    excludeWords: '',
    categoryId: 'all',
    searchIn: 'title_description',
    priceMin: '',
    priceMax: '',
    condition: 'all',
    buyingFormat: 'all',
    returnsAccepted: false,
    freeShipping: false,
    localPickup: false,
    soldItems: false,
    completedItems: false,
    auction: false,
    buyItNow: false,
    acceptsOffers: false,
    itemLocation: 'default',
    distance: '25',
    zipCode: '',
    sortBy: 'best_match',
    resultsPerPage: '50',
    endingWithin: 'all'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const params = new URLSearchParams();
    
    if (searchParams.keywords) params.append('q', searchParams.keywords);
    if (searchParams.excludeWords) params.append('exclude', searchParams.excludeWords);
    if (searchParams.categoryId !== 'all') params.append('categoryId', searchParams.categoryId);
    if (searchParams.priceMin) params.append('minPrice', searchParams.priceMin);
    if (searchParams.priceMax) params.append('maxPrice', searchParams.priceMax);
    if (searchParams.condition !== 'all') params.append('condition', searchParams.condition);
    if (searchParams.returnsAccepted) params.append('returnsAccepted', true);
    if (searchParams.freeShipping) params.append('freeShipping', true);
    if (searchParams.localPickup) params.append('localPickup', true);
    if (searchParams.soldItems) params.append('soldItems', true);
    if (searchParams.completedItems) params.append('completedItems', true);
    if (searchParams.auction) params.append('isAuction', true);
    if (searchParams.buyItNow) params.append('isBuyItNow', true);
    if (searchParams.acceptsOffers) params.append('acceptsOffers', true);
    if (searchParams.sortBy && searchParams.sortBy !== 'best_match') params.append('sortBy', searchParams.sortBy);
    if (searchParams.resultsPerPage && searchParams.resultsPerPage !== '50') params.append('limit', searchParams.resultsPerPage);

    if (searchParams.itemLocation === 'zip' && searchParams.zipCode) {
      params.append('zipCode', searchParams.zipCode);
      params.append('distance', searchParams.distance);
    } else if (searchParams.itemLocation === 'us_only') {
      params.append('location', 'US');
    } else if (searchParams.itemLocation === 'north_america') {
      params.append('location', 'NA');
    } else if (searchParams.itemLocation === 'worldwide') {
      params.append('location', 'WW');
    }

    if (searchParams.endingWithin !== 'all') {
      params.append('endingWithin', searchParams.endingWithin);
    }

    navigate(`/search?${params.toString()}`);
    setLoading(false);
  };

  const clearAll = () => {
    setSearchParams({
      keywords: '',
      excludeWords: '',
      categoryId: 'all',
      searchIn: 'title_description',
      priceMin: '',
      priceMax: '',
      condition: 'all',
      buyingFormat: 'all',
      returnsAccepted: false,
      freeShipping: false,
      localPickup: false,
      soldItems: false,
      completedItems: false,
      auction: false,
      buyItNow: false,
      acceptsOffers: false,
      itemLocation: 'default',
      distance: '25',
      zipCode: '',
      sortBy: 'best_match',
      resultsPerPage: '50',
      endingWithin: 'all'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
        {/* Breadcrumb - Mobile friendly */}
        <div className="text-xs sm:text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <Link to="/search" className="hover:text-blue-600">Search</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-gray-700 font-semibold">Advanced Search</span>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header - Mobile friendly */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4">
            <h1 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🔍</span>
              Advanced Search
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm">Find exactly what you're looking for</p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* ===== KEYWORDS - Stacks on mobile ===== */}
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Keywords or item number
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={searchParams.keywords}
                  onChange={handleChange}
                  placeholder="e.g. iPhone 15, vintage watch"
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Exclude words
                </label>
                <input
                  type="text"
                  name="excludeWords"
                  value={searchParams.excludeWords}
                  onChange={handleChange}
                  placeholder="e.g. refurbished, used"
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                />
              </div>
            </div>

            {/* ===== CATEGORY ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="categoryId"
                value={searchParams.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c.isActive !== false).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* ===== SEARCH INCLUDING - Mobile friendly checkboxes ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Search Including
              </label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="radio"
                    name="searchIn"
                    value="title_description"
                    checked={searchParams.searchIn === 'title_description'}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Title & description
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="radio"
                    name="searchIn"
                    value="title_only"
                    checked={searchParams.searchIn === 'title_only'}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Title only
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="completedItems"
                    checked={searchParams.completedItems}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Completed
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="soldItems"
                    checked={searchParams.soldItems}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Sold
                </label>
              </div>
            </div>

            {/* ===== PRICE - Mobile friendly ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-gray-500">$</span>
                <input
                  type="number"
                  name="priceMin"
                  value={searchParams.priceMin}
                  onChange={handleChange}
                  placeholder="Min"
                  className="w-24 sm:w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                />
                <span className="text-xs sm:text-sm text-gray-500">to</span>
                <span className="text-xs sm:text-sm text-gray-500">$</span>
                <input
                  type="number"
                  name="priceMax"
                  value={searchParams.priceMax}
                  onChange={handleChange}
                  placeholder="Max"
                  className="w-24 sm:w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                />
              </div>
            </div>

            {/* ===== BUYING FORMAT - Mobile friendly ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Buying Format
              </label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="auction"
                    checked={searchParams.auction}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Auction
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="buyItNow"
                    checked={searchParams.buyItNow}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Buy It Now
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="acceptsOffers"
                    checked={searchParams.acceptsOffers}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Accepts offers
                </label>
              </div>
            </div>

            {/* ===== CONDITION - Mobile friendly ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={searchParams.condition === 'NEW'}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSearchParams({
                        ...searchParams,
                        condition: isChecked ? 'NEW' : 'all'
                      });
                    }}
                    className="w-4 h-4"
                  />
                  New
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={searchParams.condition === 'USED'}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSearchParams({
                        ...searchParams,
                        condition: isChecked ? 'USED' : 'all'
                      });
                    }}
                    className="w-4 h-4"
                  />
                  Used
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={searchParams.condition === 'REFURBISHED'}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSearchParams({
                        ...searchParams,
                        condition: isChecked ? 'REFURBISHED' : 'all'
                      });
                    }}
                    className="w-4 h-4"
                  />
                  Refurbished
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={searchParams.condition === 'all'}
                    onChange={() => setSearchParams({ ...searchParams, condition: 'all' })}
                    className="w-4 h-4"
                  />
                  Not specified
                </label>
              </div>
            </div>

            {/* ===== SHOW RESULTS - Mobile friendly ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Show Results
              </label>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="returnsAccepted"
                    checked={searchParams.returnsAccepted}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Returns accepted
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="freeShipping"
                    checked={searchParams.freeShipping}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Free shipping
                </label>
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-h-[36px]">
                  <input
                    type="checkbox"
                    name="localPickup"
                    checked={searchParams.localPickup}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  Local pickup
                </label>
              </div>
            </div>

            {/* ===== ITEM LOCATION - Mobile friendly ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Item Location
              </label>
              <div className="space-y-2">
                <select
                  name="itemLocation"
                  value={searchParams.itemLocation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                >
                  <option value="default">Default</option>
                  <option value="us_only">US Only</option>
                  <option value="north_america">North America</option>
                  <option value="worldwide">Worldwide</option>
                  <option value="zip">Within miles of ZIP</option>
                </select>
                {searchParams.itemLocation === 'zip' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="zipCode"
                      value={searchParams.zipCode}
                      onChange={handleChange}
                      placeholder="ZIP Code"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                    />
                    <input
                      type="number"
                      name="distance"
                      value={searchParams.distance}
                      onChange={handleChange}
                      placeholder="Miles"
                      className="w-20 sm:w-24 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ===== ENDING WITHIN ===== */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Items ending within
              </label>
              <select
                name="endingWithin"
                value={searchParams.endingWithin}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
              >
                <option value="all">Any time</option>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="168">7 days</option>
              </select>
            </div>

            {/* ===== SORT & RESULTS - Stacks on mobile ===== */}
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  name="sortBy"
                  value={searchParams.sortBy}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                >
                  <option value="best_match">Best Match</option>
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="ending_soon">Ending Soon</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Results Per Page
                </label>
                <select
                  name="resultsPerPage"
                  value={searchParams.resultsPerPage}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="75">75</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                </select>
              </div>
            </div>

            {/* ===== BUTTONS - Full width on mobile ===== */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition min-h-[48px] text-sm"
              >
                {loading ? 'Searching...' : '🔍 Search'}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition min-h-[48px] text-sm"
              >
                Clear All
              </button>
            </div>

            {/* ===== TIPS - Mobile friendly ===== */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-800">
                💡 <strong>Tips:</strong> Use quotes for exact phrases, hyphens to exclude words, or OR between keywords.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdvancedSearchPage;
