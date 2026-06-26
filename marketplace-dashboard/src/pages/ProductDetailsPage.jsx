/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_BASE_URL = 'http://estore.snopitech.com/api';

function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState('');
  
  // ===== WISHLIST STATE =====
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // ===== REVIEWS STATE =====
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  
  // ===== MESSAGE STATE =====
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [messageError, setMessageError] = useState('');

  useEffect(() => {
    fetchProduct();
    checkWishlistStatus();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await response.json();
      setProduct(data);
      setLoading(false);
      
      if (user) {
        checkPurchaseStatus();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping purchase check');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/orders/check-purchase?productId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasPurchased(data.hasPurchased || false);
      } else {
        console.log('Purchase check endpoint not available, defaulting to false');
        setHasPurchased(false);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
      setHasPurchased(false);
    }
  };

  // ===== WISHLIST FUNCTIONS =====
  const checkWishlistStatus = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/wishlist/check/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.inWishlist || false);
      } else {
        console.log('Failed to check wishlist status');
        setIsInWishlist(false);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please login to save items to your wishlist');
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        navigate('/login');
        return;
      }
      
      const url = isInWishlist 
        ? `${API_BASE_URL}/wishlist/remove/${id}`
        : `${API_BASE_URL}/wishlist/add/${id}`;
      
      const response = await fetch(url, {
        method: isInWishlist ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
        alert(isInWishlist ? '❌ Removed from Saved' : '✅ Added to Saved!');
      } else {
        const data = await response.json();
        console.error('Wishlist error:', data);
        alert(data.message || 'Failed to update saved items');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Error updating saved items. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  // ===== REVIEW FUNCTIONS =====
  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${id}`);
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to write a review');
      navigate('/login');
      return;
    }

    if (!hasPurchased) {
      alert('You can only review products you have purchased.');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: parseInt(id),
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await response.json();

      if (response.ok) {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewRating(5);
        await fetchReviews();
        await fetchProduct();
        setTimeout(() => setReviewSuccess(false), 3000);
      } else {
        setReviewError(data.message || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError('Network error. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  // ===== MESSAGE FUNCTIONS =====
  const handleOpenMessageModal = () => {
    if (!user) {
      alert('Please login to message the seller');
      navigate('/login');
      return;
    }
    setShowMessageModal(true);
    setMessageSubject(`Question about: ${product?.name}`);
    setMessageContent('');
    setMessageError('');
    setMessageSuccess(false);
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    setMessageSubject('');
    setMessageContent('');
    setMessageError('');
    setMessageSuccess(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setMessageSending(true);
    setMessageError('');
    setMessageSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          sellerId: product.sellerId,
          subject: messageSubject,
          message: messageContent,
          buyerEmail: user?.email,
          buyerName: user?.firstName + ' ' + user?.lastName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessageSuccess(true);
        setMessageSending(false);
        setTimeout(() => {
          handleCloseMessageModal();
        }, 3000);
      } else {
        setMessageError(data.message || 'Failed to send message. Please try again.');
        setMessageSending(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageError('Network error. Please try again.');
      setMessageSending(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const success = await addToCart(product.id, selectedQuantity);
      if (success) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const getImageUrl = (images) => {
    if (!images) return null;
    try {
      const parsed = JSON.parse(images);
      return parsed[0] || null;
    } catch {
      return images;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Product not found</div>
      </div>
    );
  }

  const productImage = getImageUrl(product.images);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <Link to={`/categories/${product.categoryId}`} className="hover:text-blue-600">
            {product.categoryName || 'Products'}
          </Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        {/* Product Section - Wider */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 p-4 sm:p-8">
            {/* Product Image */}
            <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 sm:p-8 min-h-[250px] sm:min-h-[400px] relative">
              {productImage ? (
                <img 
                  src={productImage} 
                  alt={product.name}
                  className="w-full max-h-72 sm:max-h-96 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>

            {/* Product Info - Wider */}
            <div className="space-y-4 sm:space-y-5">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex-1">{product.name}</h1>
                
                {/* Save/Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`flex-shrink-0 p-3 rounded-full border-2 transition min-h-[48px] min-w-[48px] flex items-center justify-center ${
                    isInWishlist 
                      ? 'bg-red-50 border-red-500 text-red-500 hover:bg-red-100' 
                      : 'bg-white border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-400'
                  }`}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {wishlistLoading ? (
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg 
                      className="w-6 h-6" 
                      fill={isInWishlist ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              {product.brand && (
                <p className="text-gray-600 text-xs sm:text-sm">Brand: <span className="font-medium">{product.brand}</span></p>
              )}
              
              {/* Rating */}
              <div className="flex items-center gap-2 sm:gap-3">
                {product.rating > 0 && (
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-base sm:text-lg">★</span>
                    <span className="font-semibold ml-1 text-sm sm:text-base">{product.rating}</span>
                    <span className="text-gray-400 text-xs sm:text-sm ml-1">({product.reviewsCount || 0})</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <span className="text-2xl sm:text-3xl font-bold text-blue-700">${product.price}</span>
                {product.compareAtPrice > product.price && (
                  <span className="ml-2 sm:ml-3 text-gray-400 line-through text-base sm:text-lg">${product.compareAtPrice}</span>
                )}
              </div>

              {/* Stock */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                  product.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.quantity > 0 && (
                  <span className="text-gray-500 text-xs sm:text-sm">{product.quantity} available</span>
                )}
              </div>

              {/* Seller Info */}
              <div className="border-t border-b py-2 sm:py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Sold by</p>
                    <p className="font-semibold text-sm sm:text-base text-gray-700">{product.storeName || 'Direct Seller'}</p>
                  </div>
                  {user && user.id !== product.sellerId && (
                    <button
                      onClick={handleOpenMessageModal}
                      className="flex items-center gap-1 sm:gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 sm:px-4 py-2 rounded-lg transition text-sm min-h-[44px]"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="hidden xs:inline">Message</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <label className="text-gray-700 font-medium text-sm sm:text-base">Qty:</label>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition min-h-[44px] min-w-[44px] text-lg"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 min-w-12 text-center text-sm sm:text-base">{selectedQuantity}</span>
                  <button
                    onClick={() => setSelectedQuantity(Math.min(product.quantity, selectedQuantity + 1))}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition min-h-[44px] min-w-[44px] text-lg"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className={`w-full py-3 rounded-lg font-semibold text-white transition min-h-[48px] text-sm sm:text-base ${
                  product.quantity > 0 
                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {addedToCart ? '✅ Added!' : product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Wider */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b overflow-x-auto hide-scrollbar">
            <div className="flex min-w-max sm:min-w-0">
              {['details', 'reviews', 'seller'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 font-medium text-xs sm:text-sm transition whitespace-nowrap capitalize min-h-[44px] ${
                    activeTab === tab 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'reviews' ? `Reviews (${product.reviewsCount || 0})` : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'details' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Description</h3>
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <h3 className="text-base sm:text-lg font-semibold">Customer Reviews</h3>
                  {user && hasPurchased && (
                    <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                      ✅ Purchased
                    </span>
                  )}
                </div>

                {/* Review Form */}
                {user ? (
                  hasPurchased ? (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">Write a Review</h4>
                      <form onSubmit={handleSubmitReview} className="space-y-3">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rating</label>
                          <div className="flex gap-1 sm:gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className={`text-2xl sm:text-3xl focus:outline-none min-h-[44px] min-w-[44px] ${
                                  star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                                aria-label={`Rate ${star} stars`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Comment</label>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                            placeholder="Share your experience..."
                            required
                          />
                        </div>
                        {reviewError && <div className="text-red-600 text-xs sm:text-sm">{reviewError}</div>}
                        {reviewSuccess && <div className="text-green-600 text-xs sm:text-sm">✅ Review submitted!</div>}
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm min-h-[44px]"
                        >
                          {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 text-center">
                      <p className="text-yellow-700 text-sm sm:text-base">🛒 Purchase this product to review.</p>
                    </div>
                  )
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                    <p className="text-gray-600 text-sm sm:text-base">
                      <Link to="/login" className="text-blue-600 hover:underline">Login</Link> to write a review.
                    </p>
                  </div>
                )}

                {/* Reviews List */}
                {reviewsLoading ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <p className="text-base sm:text-lg">No reviews yet.</p>
                    <p className="text-xs sm:text-sm">Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-3 sm:pb-4 last:border-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-yellow-500 text-sm sm:text-base">{renderStars(review.rating)}</span>
                          <span className="font-semibold text-sm sm:text-base">{review.userName || 'Anonymous'}</span>
                          <span className="text-gray-400 text-xs sm:text-sm">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm sm:text-base mt-1">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'seller' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">About the Seller</h3>
                <p className="text-sm sm:text-base text-gray-700">{product.storeName}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal - Mobile Bottom Sheet */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Message Seller</h2>
                <button
                  onClick={handleCloseMessageModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl min-h-[44px] min-w-[44px]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {messageSuccess ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-green-500 text-4xl sm:text-5xl mb-4">✅</div>
                  <p className="text-base sm:text-lg font-semibold text-gray-700">Message Sent!</p>
                  <p className="text-sm sm:text-base text-gray-500 mt-2">The seller will respond via email.</p>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Product</label>
                    <p className="text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border text-sm">{product?.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Message</label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                      placeholder="Ask about availability, condition, shipping..."
                      required
                    />
                  </div>
                  {messageError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {messageError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={messageSending}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base min-h-[48px]"
                  >
                    {messageSending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
