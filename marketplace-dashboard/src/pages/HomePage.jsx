/* eslint-disable no-useless-assignment */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// ===== CHANGE THIS LINE =====
// From: const API_BASE_URL = 'http://estore.snopitech.com/api';
// To: const API_BASE_URL = '/api';
// OR use environment variable:
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Refs for camera
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  // ===== CAMERA SEARCH FUNCTIONS =====

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.log('Camera not available, opening file picker');
      fileInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    
    closeCamera();
    
    if (blob) {
      await searchByImage(blob);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File selected:', file.name, file.type, file.size);
    await searchByImage(file);
    e.target.value = '';
  };

  const searchByImage = async (imageFile) => {
    console.log('searchByImage called with:', imageFile);
    
    if (!imageFile) {
      console.log('No image file provided');
      return;
    }
    
    setIsSearching(true);
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      console.log('Sending request to:', `${API_BASE_URL}/search/by-image`);
      
      const response = await fetch(`${API_BASE_URL}/search/by-image`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Search failed: ${response.status} ${errorText}`);
      }
      
      const results = await response.json();
      console.log('Search results:', results);
      
      if (results && results.length > 0) {
        setSearchResults(results);
        setSelectedCategory('all');
        setSearchQuery('');
      } else {
        setSearchResults([]);
        alert('No matching products found. Try a different image.');
      }
      
    } catch (error) {
      console.error('Image search error:', error);
      alert('Image search failed. Please try again. Error: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setSearchQuery('');
  };

  const handleTextSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results);
      setSelectedCategory('all');
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // ===== END CAMERA SEARCH FUNCTIONS =====

  const displayedProducts = searchResults !== null ? searchResults : 
    (selectedCategory === 'all' ? products : products.filter(product => product.categoryId === parseInt(selectedCategory)));

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

  const getPlaceholderSvg = (size = 200) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading eStore marketplace...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 pb-20 sm:pb-0">
      
      {/* ====== SEARCH BAR WITH CAMERA - FULL WIDTH ====== */}
      <div className="bg-white shadow-md sticky top-0 z-20 py-2 sm:py-3">
        <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2 w-full">
              <select 
                className="border rounded-l px-2 sm:px-3 py-2 bg-gray-50 text-xs sm:text-sm w-28 sm:w-40 lg:w-48 flex-shrink-0"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSearchResults(null);
                }}
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c.isActive !== false).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Search for anything..."
                className="border flex-1 px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    setSearchResults(null);
                  }
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSearch(searchQuery);
                  }
                }}
              />
              
              <button
                onClick={openCamera}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded border transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Search by image"
                disabled={isSearching}
              >
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              
              <button 
                onClick={() => handleTextSearch(searchQuery)}
                className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded transition-colors min-h-[44px] font-medium"
              >
                Search
              </button>
            </div>
            
            <div className="flex items-center gap-2 sm:hidden">
              <button 
                onClick={() => handleTextSearch(searchQuery)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors min-h-[44px] text-sm font-medium"
              >
                Search
              </button>
              
              {(searchResults !== null || searchQuery) && (
                <button 
                  onClick={clearSearch}
                  className="text-gray-500 hover:text-gray-700 text-sm min-h-[44px] px-3"
                >
                  Clear
                </button>
              )}
            </div>
            
            {(searchResults !== null || searchQuery) && (
              <button 
                onClick={clearSearch}
                className="hidden sm:block text-gray-500 hover:text-gray-700 text-sm min-h-[44px]"
              >
                Clear
              </button>
            )}
          </div>
          
          {searchResults !== null && (
            <div className="mt-2 text-sm text-gray-600">
              Found {searchResults.length} results for your image
              <button 
                onClick={clearSearch}
                className="ml-2 text-blue-600 hover:underline"
              >
                Back to all products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ====== CAMERA OVERLAY ====== */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <video 
            ref={videoRef}
            className="max-h-[80vh] max-w-full"
            autoPlay
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-10 flex gap-4">
            <button 
              onClick={captureImage}
              className="bg-white rounded-full p-4 hover:bg-gray-100 transition min-h-[72px] min-w-[72px]"
            >
              <svg className="w-12 h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                <circle cx="12" cy="12" r="6" fill="currentColor" />
              </svg>
            </button>
            <button 
              onClick={closeCamera}
              className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition min-h-[44px]"
            >
              Cancel
            </button>
          </div>
          <div className="absolute top-10 text-white text-sm">
            Tap the circle to capture
          </div>
        </div>
      )}

      {/* Hidden file input for desktop fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Category Navigation - Full width */}
      <nav className="bg-gray-800 text-white sticky top-0 z-10">
        <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
          <ul className="flex space-x-4 sm:space-x-6 overflow-x-auto py-2 sm:py-3 text-xs sm:text-sm hide-scrollbar">
            <li 
              className={`cursor-pointer hover:text-blue-300 whitespace-nowrap ${selectedCategory === 'all' ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              onClick={() => {
                setSelectedCategory('all');
                setSearchResults(null);
              }}
            >
              All
            </li>
            {categories.filter(c => c.isActive !== false).map(category => (
              <li 
                key={category.id}
                className={`cursor-pointer hover:text-blue-300 whitespace-nowrap ${selectedCategory === category.id ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setSearchResults(null);
                }}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ====== HERO BANNER - SKINNY VERSION ====== */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-purple-700 text-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
            <div>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <div className="inline-block bg-yellow-400 text-blue-900 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse whitespace-nowrap">
                  🔥 LIMITED OFFER
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                  Secure Purchase
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                <p className="text-sm sm:text-base font-semibold">Sell your vehicles for <span className="text-yellow-300">free</span></p>
                <span className="hidden sm:inline text-blue-300">|</span>
                <p className="text-xs sm:text-sm text-blue-200">Zero listing fees • Verified buyers</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-3">
                <button className="bg-yellow-400 text-blue-900 px-5 sm:px-6 py-1.5 sm:py-2 rounded-lg font-bold hover:bg-yellow-300 transition text-xs sm:text-sm min-h-[40px] shadow-lg">
                  🚀 List Now
                </button>
                <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg px-3 py-1 sm:px-4 sm:py-1.5">
                  <p className="text-yellow-300 font-bold text-xs sm:text-sm">⏰ Ends 7/15</p>
                </div>
                <Link to="/secure-purchase" className="text-blue-200 hover:text-white text-xs sm:text-sm underline">
                  Learn More →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-white/20">
                <div className="text-xl sm:text-2xl">💰</div>
                <div className="text-sm sm:text-lg font-bold">$0</div>
                <div className="text-[8px] sm:text-xs text-blue-200">Fees</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-white/20">
                <div className="text-xl sm:text-2xl">👥</div>
                <div className="text-sm sm:text-lg font-bold">10k+</div>
                <div className="text-[8px] sm:text-xs text-blue-200">Buyers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-white/20">
                <div className="text-xl sm:text-2xl">⚡</div>
                <div className="text-sm sm:text-lg font-bold">24h</div>
                <div className="text-[8px] sm:text-xs text-blue-200">Avg Sale</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center border border-white/20">
                <div className="text-xl sm:text-2xl">🔒</div>
                <div className="text-sm sm:text-lg font-bold">100%</div>
                <div className="text-[8px] sm:text-xs text-blue-200">Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* eStore Live Section */}
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">eStore Live</h2>
          <a href="#" className="text-blue-600 hover:underline text-sm">Tune in</a>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-300 h-24 sm:h-32 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-red-600 font-bold text-sm">LIVE</span>
                  <span className="ml-1 text-sm">- 83</span>
                </div>
              </div>
              <div className="p-1 sm:p-2 text-center">
                <p className="text-xs font-medium">GREAT</p>
                <p className="text-xs text-gray-500">Great</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid - Wider */}
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold">
            {searchResults !== null ? 'Search Results' : 'Recommended for you'}
          </h2>
          {searchResults === null && (
            <Link to="/products" className="text-blue-600 hover:underline text-xs sm:text-sm">
              SEE ALL
            </Link>
          )}
        </div>

        {displayedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm sm:text-base">
              {searchResults !== null ? 'No products match your search.' : 'No products found in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-4">
            {displayedProducts.slice(0, searchResults !== null ? displayedProducts.length : 12).map((product) => {
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
                  className="block bg-white rounded-lg shadow hover:shadow-lg transition group relative"
                >
                  {/* Stock Badge */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                    {inStock ? (
                      <span className="bg-green-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        Out
                      </span>
                    )}
                  </div>

                  <div className="h-32 sm:h-40 bg-gray-100 rounded-t-lg flex items-center justify-center p-2 sm:p-3">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getPlaceholderSvg(200);
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
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">{product.storeName}</p>
                    <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-2 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    <div className="text-base sm:text-lg font-bold text-gray-900">${product.price}</div>
                    {inStock && (
                      <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">
                        {product.quantity} available
                      </div>
                    )}
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
      </div>
    </div>
  );
}

export default HomePage;
