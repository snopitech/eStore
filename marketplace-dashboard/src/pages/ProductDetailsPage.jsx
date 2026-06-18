/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8087/api';

function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const { addToCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    fetchProduct();
    fetchReviews();
    checkWishlistStatus();
  }, [id]);

  const fetchProduct = () => {
    fetch(`${API_BASE_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.storeSlug) {
          fetch(`${API_BASE_URL}/seller/store/${data.storeSlug}`)
            .then(res => res.json())
            .then(sellerData => setSeller(sellerData))
            .catch(err => console.error(err));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchReviews = () => {
    fetch(`${API_BASE_URL}/reviews/product/${id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setReviewsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
        setReviewsLoading(false);
      });
  };

  const checkWishlistStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist/check/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setIsInWishlist(data);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await fetch(`${API_BASE_URL}/wishlist/remove/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsInWishlist(false);
        alert('Removed from wishlist');
      } else {
        await fetch(`${API_BASE_URL}/wishlist/add/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsInWishlist(true);
        alert('Added to wishlist!');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
    setWishlistLoading(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const success = await addToCart(product.id, quantity);
    if (success) {
      alert(`Added ${quantity} item(s) to cart!`);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const success = await addToCart(product.id, quantity);
    if (success) {
      navigate('/cart');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSubmittingReview(true);
    try {
      const ordersResponse = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orders = await ordersResponse.json();
      
      let orderItemId = null;
      for (const order of orders) {
        for (const item of order.items || []) {
          if (item.productId === parseInt(id)) {
            orderItemId = item.id;
            break;
          }
        }
        if (orderItemId) break;
      }
      
      if (!orderItemId) {
        alert('You need to purchase this product before reviewing it.');
        setSubmittingReview(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: parseInt(id),
          orderItemId: orderItemId,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          images: '[]'
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Review submitted successfully!');
        setShowReviewForm(false);
        setReviewForm({ rating: 5, title: '', comment: '' });
        fetchReviews();
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  let images = [];
  try {
    if (product.images) {
      images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    }
  } catch (e) {
    images = [];
  }

  let specs = {};
  try {
    if (product.specifications) {
      specs = typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications;
    }
  } catch (e) {
    specs = {};
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <Link to={`/category/${product.categoryId}`} className="hover:text-blue-600">
            {product.categoryName || 'Products'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div>
              <div className="border rounded-lg overflow-hidden bg-gray-100 h-96 flex items-center justify-center">
                {images.length > 0 && images[selectedImage] ? (
                  <img 
                    src={images[selectedImage]} 
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-16 border rounded overflow-hidden flex-shrink-0 ${
                        selectedImage === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              
              <Link to={`/store/${product.storeSlug}`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
                Visit Store: {product.storeName}
              </Link>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(Math.floor(avgRating))}
                  {'☆'.repeat(5 - Math.floor(avgRating))}
                </div>
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                <span className="text-sm text-gray-500">{product.salesCount || 0} sold</span>
              </div>

              <div className="mb-4">
                {product.compareAtPrice && product.compareAtPrice > product.price ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">${product.price}</span>
                    <span className="text-lg text-gray-400 line-through ml-2">${product.compareAtPrice}</span>
                    <span className="ml-2 text-green-600 text-sm">
                      Save ${(product.compareAtPrice - product.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-red-600">${product.price}</span>
                )}
                <p className="text-sm text-green-600 mt-1">Free shipping</p>
              </div>

              {/* Wishlist Button */}
              {user && (
                <div className="mb-4">
                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                      isInWishlist 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {isInWishlist ? 'Saved to Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Quantity:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity || 10, quantity + 1))}
                    className="w-8 h-8 border rounded hover:bg-gray-100"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-500 ml-2">
                    {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.quantity === 0}
                  className="flex-1 bg-yellow-500 text-gray-900 py-3 rounded-md font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {seller && (
                <div className="border rounded-lg p-4 mb-4">
                  <h3 className="font-semibold mb-2">Seller Information</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <Link to={`/store/${seller.storeSlug}`} className="font-medium hover:text-blue-600">
                        {seller.storeName}
                      </Link>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span>{seller.rating || 0} rating</span>
                        <span className="text-gray-400">|</span>
                        <span>{seller.totalSales || 0} sales</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t p-6">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{product.description || 'No description available.'}</p>
            </div>
            
            {Object.keys(specs).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Specifications</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specs).map(([key, value]) => (
                      <tr key={key} className="border-b">
                        <td className="py-2 font-medium w-1/3">{key}</td>
                        <td className="py-2 text-gray-600">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="border-t p-6">
            <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
            
            {reviewsLoading ? (
              <p className="text-gray-500">Loading reviews...</p>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold">
                      {avgRating}
                    </div>
                    <div>
                      <div className="flex text-yellow-400 text-xl">
                        {'★'.repeat(Math.floor(avgRating))}
                        {'☆'.repeat(5 - Math.floor(avgRating))}
                      </div>
                      <div className="text-sm text-gray-500">{reviews.length} reviews</div>
                    </div>
                  </div>
                </div>

                {user && (
                  <div className="mb-4">
                    {!showReviewForm ? (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Write a Review
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}

                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold mb-3">Write Your Review</h3>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Comment</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        rows="4"
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet for this product.</p>
                    <p className="text-sm text-gray-400">Be the first to review this product!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex text-yellow-400">
                              {'★'.repeat(review.rating)}
                              {'☆'.repeat(5 - review.rating)}
                            </div>
                            <h3 className="font-semibold mt-1">{review.title}</h3>
                            <p className="text-gray-700 mt-1">{review.comment}</p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>{review.reviewerName}</div>
                            <div>{new Date(review.createdAt).toLocaleDateString()}</div>
                            {review.verifiedPurchase && (
                              <span className="text-green-600 text-xs">Verified Purchase</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsPage;