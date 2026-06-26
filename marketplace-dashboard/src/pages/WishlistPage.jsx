/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_BASE_URL = 'http://estore.snopitech.com/api';

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!user) return;
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      const data = await response.json();
      console.log('Wishlist items:', data);
      setWishlistItems(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/remove/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Remove from list locally
        setWishlistItems(wishlistItems.filter(item => item.product.id !== productId));
        alert('❌ Removed from Saved');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to remove');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Error removing item');
    }
  };

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId, 1);
    if (success) {
      alert('🛒 Added to cart!');
    }
  };

  // Get product image from JSON
  const getProductImage = (product) => {
    if (!product || !product.images) return null;
    try {
      const images = JSON.parse(product.images);
      return images[0] || null;
    } catch (e) {
      return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">You need to be logged in to view your saved items.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 min-h-[44px] inline-flex items-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your saved items...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">❤️ Saved Items</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{wishlistItems.length} items</span>
            <Link to="/" className="text-blue-600 hover:underline text-sm sm:text-base">
              Continue Shopping →
            </Link>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">No saved items yet</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6">Start saving your favorite products!</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base min-h-[44px] inline-flex items-center">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {wishlistItems.map((item) => {
              const productImage = getProductImage(item.product);
              
              return (
                <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition group relative">
                  {/* Remove button - top right */}
                  <button
                    onClick={() => removeFromWishlist(item.product.id)}
                    className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-red-50 transition"
                    title="Remove from saved"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  <Link to={`/product/${item.product.id}`}>
                    <div className="h-32 sm:h-40 bg-gray-100 rounded-t-lg flex items-center justify-center p-2 sm:p-3">
                      {productImage ? (
                        <img 
                          src={productImage} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-2 sm:p-3">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 hover:text-blue-600 line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                      <div className="text-base sm:text-lg font-bold text-gray-900">${item.product.price}</div>
                      {item.product.quantity > 0 ? (
                        <span className="text-[8px] sm:text-xs text-green-600">In Stock</span>
                      ) : (
                        <span className="text-[8px] sm:text-xs text-red-600">Out of Stock</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                      <button
                        onClick={() => handleAddToCart(item.product.id)}
                        disabled={item.product.quantity <= 0}
                        className={`flex-1 px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-sm min-h-[36px] sm:min-h-[44px] ${
                          item.product.quantity > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {item.product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
