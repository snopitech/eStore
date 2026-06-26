/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_BASE_URL = 'http://localhost:8087/api';

function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      console.log('🔄 Fetching categories from:', `${API_BASE_URL}/categories`);
      const response = await fetch(`${API_BASE_URL}/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Categories received from API:', data);
      
      // Filter to only show active categories
      const activeCategories = Array.isArray(data) 
        ? data.filter(c => c.isActive !== false) 
        : [];
      
      console.log('✅ Active categories:', activeCategories);
      console.log('📊 Total active categories:', activeCategories.length);
      
      setCategories(activeCategories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      // Fallback categories if API fails
      console.log('📋 Using fallback categories');
      setCategories([
        { id: 1, name: 'Motors', slug: 'motors' },
        { id: 2, name: 'Electronics', slug: 'electronics' },
        { id: 3, name: 'Collectibles', slug: 'collectibles' },
        { id: 4, name: 'Home & Garden', slug: 'home-garden' },
        { id: 5, name: 'Clothing & Accessories', slug: 'clothing' },
        { id: 6, name: 'Toys', slug: 'toys' },
        { id: 7, name: 'Sporting Goods', slug: 'sporting-goods' },
        { id: 8, name: 'Business & Industrial', slug: 'business-industrial' },
        { id: 9, name: 'Jewelry & Watches', slug: 'jewelry-watches' },
        { id: 10, name: 'Refurbished', slug: 'refurbished' },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    setIsCategoryDropdownOpen(false);
    navigate(`/categories/${categoryId}`);
    setIsMobileMenuOpen(false);
  };

  const isSeller = user && user.userType === 'SELLER';

  const getDisplayName = () => {
    if (!user) return 'Sign in or register';
    if (user.firstName) {
      return user.firstName + (user.lastName ? ' ' + user.lastName : '');
    }
    return user.email ? user.email.split('@')[0] : 'User';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar - Wider */}
      <div className="hidden sm:block bg-blue-800 text-white text-xs py-1">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="font-semibold">Hi! {getDisplayName()}</span>
          </div>
          <div className="flex gap-4">
            <Link to="/daily-deals" className="hover:underline text-sm">Daily Deals</Link>
            <Link to="/brand-outlet" className="hover:underline text-sm">Brand Outlet</Link>
            <Link to="/gift-cards" className="hover:underline text-sm">Gift Cards</Link>
            <Link to="/help" className="hover:underline text-sm">Help & Contact</Link>
            <Link to="/seller/dashboard" className="hover:underline text-sm font-semibold text-yellow-300">
              Sell
            </Link>
            {isSeller && (
              <Link 
                to="/live" 
                className="hover:underline text-sm font-semibold text-red-300 animate-pulse"
              >
                🔴 Go Live
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header - Wider */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl sm:text-3xl font-bold text-blue-800">eStore</span>
          </Link>

          {/* Shop by Category - Desktop */}
          <div className="hidden lg:block relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded hover:bg-gray-50 text-sm"
            >
              <span className="font-medium">Shop by category</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border overflow-hidden z-30 max-h-96 overflow-y-auto">
                <div className="py-2">
                  <Link
                    to="/products"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-semibold border-b"
                  >
                    📦 All Categories
                  </Link>
                  {loadingCategories ? (
                    <div className="px-4 py-2 text-gray-500 text-sm">Loading categories...</div>
                  ) : categories.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500 text-sm">No categories found</div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id, category.name)}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Search - Wider */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-3xl lg:max-w-4xl mx-4">
            <div className="flex w-full border-2 border-blue-800 rounded-full overflow-hidden">
              <input
                type="text"
                placeholder="Search for anything"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2 focus:outline-none text-sm min-h-[42px]"
              />
              <button type="submit" className="bg-blue-800 text-white px-8 hover:bg-blue-900 text-sm min-h-[42px] font-medium">
                Search
              </button>
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-500">
              <Link to="/advanced-search" className="hover:text-blue-600">Advanced</Link>
              <Link to="/live" className="hover:text-blue-600 font-semibold text-red-600">🔴 eStore Live</Link>
              <Link to="/wishlist" className="hover:text-blue-600">Saved</Link>
            </div>
          </form>

          {/* Cart & User */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Icon */}
            <button
              onClick={() => document.getElementById('mobileSearch')?.classList.toggle('hidden')}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 text-gray-700 p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]"
                >
                  <span className="hidden sm:inline text-sm">{getDisplayName()}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border overflow-hidden z-30">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b bg-gray-50">
                      {getDisplayName()}
                    </div>
                    {user.userType === 'BUYER' && (
                      <Link
                        to="/seller/apply"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 border-b"
                      >
                        Become a Seller
                      </Link>
                    )}
                    <Link
                      to="/wishlist"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      My Saved Items
                    </Link>
                    <Link
                      to="/order-history"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    {user.userType === 'SELLER' && (
                      <>
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 border-t"
                        >
                          Seller Dashboard
                        </Link>
                        <Link
                          to="/live"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-2 text-red-600 hover:bg-red-50 border-t font-semibold"
                        >
                          🔴 Go Live
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 border-t"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600 p-2 min-h-[44px] min-w-[44px]">
                <span className="hidden sm:inline">Sign in</span>
                <svg className="sm:hidden w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]">
              <span className="hidden sm:inline">Cart</span>
              <svg className="sm:hidden w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div id="mobileSearch" className="hidden md:hidden mt-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search for anything"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base min-h-[44px]"
            />
            <button type="submit" className="bg-blue-800 text-white px-6 rounded-lg hover:bg-blue-900 min-h-[44px]">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`sm:hidden fixed top-0 left-0 w-64 h-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-blue-800">eStore</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {user ? `Hi, ${getDisplayName()}` : 'Welcome to eStore'}
          </div>
        </div>

        <nav className="p-4">
          <Link to="/" className="block px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/live" className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
            🔴 Live
          </Link>
          
          <div className="mt-2 border-t pt-2">
            <div className="text-xs text-gray-500 uppercase font-semibold px-4 py-2">Categories</div>
            {loadingCategories ? (
              <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="px-4 py-2 text-gray-400 text-sm">No categories</div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className="block px-4 py-3 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))
            )}
          </div>

          <div className="mt-2 border-t pt-2">
            {user ? (
              <>
                <Link to="/wishlist" className="block px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                  ❤️ Saved Items
                </Link>
                <Link to="/order-history" className="block px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                  My Orders
                </Link>
                {user.userType === 'SELLER' && (
                  <Link to="/seller/dashboard" className="block px-4 py-3 rounded-lg hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>
                    Seller Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="block px-4 py-3 rounded-lg hover:bg-gray-100 text-blue-600" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Category Navigation Bar - Shows ALL categories */}
      <div className="hidden sm:block border-t border-b bg-gray-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <ul className="flex space-x-5 overflow-x-auto py-2 text-sm text-gray-700 hide-scrollbar">
            <li className="font-semibold whitespace-nowrap">
              <Link to="/" className="hover:text-blue-600">Home</Link>
            </li>
            <li className="whitespace-nowrap">
              <Link to="/live" className="hover:text-red-600 cursor-pointer font-semibold text-red-600">
                🔴 Live
              </Link>
            </li>
            {loadingCategories ? (
              <li className="whitespace-nowrap text-gray-400">Loading categories...</li>
            ) : categories.length === 0 ? (
              <li className="whitespace-nowrap text-gray-400">No categories</li>
            ) : (
              categories.map((category) => (
                <li key={category.id} className="whitespace-nowrap">
                  <Link 
                    to={`/categories/${category.id}`} 
                    className="hover:text-blue-600 cursor-pointer"
                  >
                    {category.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;