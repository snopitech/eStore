/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-useless-assignment */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SellerRating from '../components/SellerRating';

const API_BASE_URL = 'http://localhost:8087/api';

function SellerStorefrontPage() {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [reviews, setReviews] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchSellerInfo();
  }, [storeSlug]);

  const fetchSellerInfo = async () => {
    setLoading(true);
    try {
      // Get seller profile
      const sellerResponse = await fetch(`${API_BASE_URL}/seller/store/${storeSlug}`);
      if (!sellerResponse.ok) {
        throw new Error('Seller not found');
      }
      const sellerData = await sellerResponse.json();
      setSeller(sellerData);

      // Get seller's products
      const productsResponse = await fetch(`${API_BASE_URL}/seller/store/${storeSlug}/products`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      }

      // Get seller reviews
      const reviewsResponse = await fetch(`${API_BASE_URL}/seller/store/${storeSlug}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      }

    } catch (error) {
      console.error('Error fetching seller info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    const success = await addToCart(productId, 1);
    if (success) {
      alert('Added to cart!');
    }
  };

  const getPlaceholderSvg = () => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading store...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Store Not Found</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">The store you're looking for doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const isInStock = (product) => {
    return product.quantity !== undefined && product.quantity > 0;
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Store Header / Banner - Wider */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
            {/* Store Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
              {seller.storeLogoUrl ? (
                <img 
                  src={seller.storeLogoUrl} 
                  alt={seller.storeName} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                '🏪'
              )}
            </div>
            
            {/* Store Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{seller.storeName}</h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">{seller.storeDescription || 'Welcome to my store!'}</p>
              
              <div className="mt-2">
                <SellerRating seller={seller} />
                <div className="text-xs sm:text-sm text-blue-100 mt-1">
                  {seller.totalSales || 0} sales • {seller.totalProducts || 0} products
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Navigation - Wider */}
      <div className="bg-white border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex gap-3 sm:gap-6 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 sm:py-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap min-h-[44px] ${
                activeTab === 'products' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 sm:py-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap min-h-[44px] ${
                activeTab === 'reviews' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`py-2 sm:py-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap min-h-[44px] ${
                activeTab === 'about' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              About
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content - Wider */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                <div className="text-4xl sm:text-6xl mb-4">📦</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-sm sm:text-base text-gray-500">This seller hasn't listed any products yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
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
                      className="bg-white rounded-lg shadow hover:shadow-lg transition group"
                    >
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
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-yellow-500">
                          <span>★</span>
                          <span className="text-gray-600">{product.rating || 0}</span>
                          {inStock && (
                            <span className="ml-auto text-[10px] sm:text-xs text-green-600">In Stock</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-2 group-hover:text-blue-600">
                          {product.name}
                        </h3>
                        <div className="text-base sm:text-lg font-bold text-gray-900">${product.price}</div>
                        <button
                          onClick={(e) => handleAddToCart(product.id, e)}
                          disabled={!inStock}
                          className={`w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-sm min-h-[36px] sm:min-h-[44px] ${
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
          </>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            {reviews.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-3">💬</div>
                <p className="text-sm sm:text-base text-gray-500">No reviews yet for this seller.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-3 sm:pb-4 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <div className="flex text-yellow-400 text-sm sm:text-base">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base mt-1">{review.title}</h4>
                        <p className="text-gray-700 text-sm sm:text-base mt-1">{review.comment}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {review.productName && `Product: ${review.productName}`}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 text-left sm:text-right">
                        <div>{review.reviewerName}</div>
                        <div>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}</div>
                        {review.verifiedPurchase && (
                          <span className="text-green-600 text-[10px] sm:text-xs">✅ Verified Purchase</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4">About {seller.storeName}</h3>
            
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-600">
              <p><strong>Store Name:</strong> {seller.storeName}</p>
              <p><strong>Store Slug:</strong> {seller.storeSlug}</p>
              <p><strong>Description:</strong> {seller.storeDescription || 'No description provided.'}</p>
              <p><strong>Joined:</strong> {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Total Products:</strong> {seller.totalProducts || 0}</p>
              <p><strong>Total Sales:</strong> {seller.totalSales || 0}</p>
              <p><strong>Rating:</strong> {seller.averageRating ? seller.averageRating.toFixed(1) : '0.0'} / 5.0</p>
              <p><strong>Total Reviews:</strong> {seller.totalReviews || 0}</p>
              <p><strong>Positive Reviews:</strong> {seller.positiveReviews || 0}</p>
            </div>

            <div className="mt-4 sm:mt-6 pt-4 border-t">
              <Link 
                to={`/store/${seller.storeSlug}/contact`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-[44px] inline-flex items-center"
              >
                Contact Seller
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerStorefrontPage;