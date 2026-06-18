/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  return (
    <header className="bg-white">
      {/* Top Bar - Blue */}
      <div className="bg-blue-800 text-white text-sm py-1">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="font-semibold">Hi! {user ? user.email?.split('@')[0] : 'Sign in or register'}</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline text-sm">Daily Deals</a>
            <a href="#" className="hover:underline text-sm">Brand Outlet</a>
            <a href="#" className="hover:underline text-sm">Gift Cards</a>
            <a href="#" className="hover:underline text-sm">Help & Contact</a>
            <Link to="/seller/dashboard" className="hover:underline text-sm font-semibold text-yellow-300">
              Sell
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* eStore Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-3xl font-bold text-blue-800">eStore</span>
          </Link>

          {/* Shop by Category */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
              <span className="font-medium">Shop by category</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
            <div className="flex border-2 border-blue-800 rounded">
              <input
                type="text"
                placeholder="Search for anything"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-4 py-2 focus:outline-none rounded-l"
              />
              <button type="submit" className="bg-blue-800 text-white px-8 py-2 hover:bg-blue-900 rounded-r">
                Search
              </button>
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-500">
              <a href="#" className="hover:text-blue-600">Advanced</a>
              <a href="#" className="hover:text-blue-600">eStore Live</a>
              <a href="#" className="hover:text-blue-600">Saved</a>
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 text-gray-700"
                >
                  <span>My eStore</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border overflow-hidden z-30">
                    <Link
                      to="/wishlist"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      My Wishlist
                    </Link>
                    <Link
                      to="/order-history"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    {user.userType === 'SELLER' && (
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-50 border-t"
                      >
                        Seller Dashboard
                      </Link>
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
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Sign in</Link>
            )}
            
            <Link to="/cart" className="relative text-gray-700 hover:text-blue-600">
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="border-t border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex space-x-5 overflow-x-auto py-2 text-sm text-gray-700">
            <li className="font-semibold whitespace-nowrap">Home</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Motors</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Electronics</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Collectibles</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Home & Garden</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Clothing, Shoes & Accessories</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Toys</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Sporting Goods</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Business & Industrial</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Jewelry & Watches</li>
            <li className="cursor-pointer hover:text-blue-600 whitespace-nowrap">Refurbished</li>
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;