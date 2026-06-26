/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-useless-assignment */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8087/api';

function LivePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [liveProducts, setLiveProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewers, setViewers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);
  const { addToCart } = useCart();
  const chatEndRef = useRef(null);
  const videoRef = useRef(null);

  const STREAM_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

  useEffect(() => {
    fetchLiveProducts();
    fetchMessages();
    
    const productInterval = setInterval(fetchLiveProducts, 30000);
    const chatInterval = setInterval(fetchMessages, 5000);
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => {
      clearInterval(productInterval);
      clearInterval(chatInterval);
      clearInterval(timerInterval);
    };
  }, []);

  // ===== AUTO-SCROLL REMOVED =====
  // The page was scrolling up automatically when new messages arrived.
  // This useEffect has been removed to prevent unwanted scrolling.

  const fetchLiveProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/live`);
      const data = await response.json();
      
      if (response.ok) {
        setLiveProducts(data.products || []);
        setViewers(data.totalViewers || 0);
        if (data.products && data.products.length > 0 && !selectedProduct) {
          setSelectedProduct(data.products[0]);
        }
        if (selectedProduct && !data.products?.find(p => p.id === selectedProduct.id)) {
          setSelectedProduct(data.products?.length > 0 ? data.products[0] : null);
        }
      } else {
        console.error('Error fetching live products:', data);
        setLiveProducts([]);
      }
    } catch (error) {
      console.error('Error fetching live products:', error);
      setLiveProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!user) {
      alert('Please login to chat');
      return;
    }
    
    const msg = {
      id: Date.now().toString(),
      user: user?.email?.split('@')[0] || 'Guest',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString(),
      isSeller: user?.userType === 'SELLER'
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(msg)
      });
      
      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const recordViewer = async (productId) => {
    try {
      await fetch(`${API_BASE_URL}/products/${productId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
    } catch (error) {
      console.error('Error recording viewer:', error);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    recordViewer(product.id);
    if (videoRef.current) {
      videoRef.current.load();
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
      alert('🛒 Added to cart from Live Deal!');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getLivePrice = (product) => {
    return product.livePrice || product.price;
  };

  const getPlaceholderSvg = () => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading live stream...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
        {/* Live Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold animate-pulse">
                🔴 LIVE
              </span>
              <h1 className="text-xl sm:text-2xl font-bold">eStore Live</h1>
              <span className="text-xs sm:text-sm opacity-75 bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                {liveProducts.length} sellers live
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span>👁️</span>
                <span className="font-bold">{viewers}</span>
                <span className="text-xs sm:text-sm opacity-75">watching</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span>⏱️</span>
                <span className="font-bold font-mono">{formatTime(timeLeft)}</span>
                <span className="text-xs sm:text-sm opacity-75">remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Sellers Grid - Scrollable */}
        {liveProducts.length > 1 && (
          <div className="mb-3 sm:mb-4 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 sm:gap-3 pb-2">
              {liveProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap transition min-h-[36px] sm:min-h-[44px] ${
                    selectedProduct?.id === product.id
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></span>
                  {product.storeName || 'Unknown Seller'}
                  <span className="text-[10px] sm:text-xs opacity-75">
                    👁️ {product.viewerCount || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Live Stream Area */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative bg-gray-900" style={{ aspectRatio: '16/9' }}>
                {selectedProduct ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      poster="/video-poster.jpg"
                      onClick={toggleVideo}
                      controls
                    >
                      <source src={STREAM_URL} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Live Badge */}
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
                      LIVE
                    </div>

                    {/* Viewer Count */}
                    <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/50 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                      <span>👁️</span>
                      {selectedProduct.viewerCount || 0}
                    </div>

                    {/* Product Name */}
                    <div className="absolute bottom-3 sm:bottom-4 left-[72px] sm:left-24 bg-black/50 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm max-w-[40%] truncate">
                      {selectedProduct.storeName} - {selectedProduct.name}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center p-4">
                      <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📺</div>
                      <p className="text-base sm:text-xl font-semibold">No Live Stream Selected</p>
                      <p className="text-xs sm:text-sm opacity-75 mt-1 sm:mt-2">Select a seller from the list above</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Section */}
              <div className="p-3 sm:p-4 border-t">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="font-semibold text-sm sm:text-base flex items-center gap-1 sm:gap-2">
                    💬 Live Chat
                    <span className="text-xs text-gray-500">({messages.length} messages)</span>
                  </h3>
                  <button 
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl min-h-[36px] min-w-[36px]"
                  >
                    {isChatOpen ? '−' : '+'}
                  </button>
                </div>
                
                {isChatOpen && (
                  <>
                    <div className="h-32 sm:h-40 md:h-48 overflow-y-auto mb-2 sm:mb-3 bg-gray-50 rounded p-2 sm:p-3 border text-xs sm:text-sm">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-400 text-xs sm:text-sm py-4 sm:py-8">
                          💬 No messages yet. Say hello!
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className={`mb-1.5 sm:mb-2 ${msg.isSeller ? 'text-right' : ''}`}>
                            <div className={`inline-block p-1.5 sm:p-2 rounded-lg max-w-[90%] sm:max-w-[85%] ${
                              msg.isSeller 
                                ? 'bg-blue-600 text-white' 
                                : msg.user === user?.email?.split('@')[0]
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                            }`}>
                              <div className="text-[10px] sm:text-xs font-bold flex flex-wrap items-center gap-1 sm:gap-2">
                                <span>{msg.user}</span>
                                <span className="opacity-50">{msg.time}</span>
                                {msg.isSeller && <span className="text-[10px]">🛒</span>}
                              </div>
                              <div className="text-xs sm:text-sm break-words">{msg.text}</div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    
                    <form onSubmit={handleSendMessage} className="flex flex-col xs:flex-row gap-2">
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={user ? "Type a message..." : "Login to chat..."}
                          disabled={!user}
                          className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs sm:text-sm min-h-[44px] disabled:bg-gray-100"
                        />
                        <button 
                          type="submit" 
                          disabled={!user}
                          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 transition text-xs sm:text-sm min-h-[44px] disabled:bg-gray-400"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                    {!user && (
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        <Link to="/login" className="text-blue-600 hover:underline">Login</Link> to join the chat
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Live Products Sidebar */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-1 sm:gap-2">
                🎁 Live Deals
              </h3>
              <span className="text-[10px] sm:text-xs bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {liveProducts.length} live
              </span>
            </div>
            
            <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto pr-1 sm:pr-2">
              {liveProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
                  <div className="text-3xl sm:text-4xl mb-2">🛍️</div>
                  <p className="text-sm sm:text-base text-gray-500">No live deals right now</p>
                  <p className="text-xs sm:text-sm text-gray-400">Check back soon!</p>
                </div>
              ) : (
                liveProducts.map((product) => {
                  let productImage = null;
                  try {
                    const images = product.images ? JSON.parse(product.images) : [];
                    productImage = images[0];
                  } catch (e) {
                    productImage = null;
                  }
                  
                  const livePrice = getLivePrice(product);
                  const isDiscounted = livePrice < product.price;
                  const discountPercent = isDiscounted 
                    ? Math.round(((product.price - livePrice) / product.price) * 100)
                    : 0;
                  
                  const isSelected = selectedProduct?.id === product.id;
                  
                  return (
                    <div 
                      key={product.id} 
                      className={`bg-white rounded-lg shadow p-2 sm:p-3 hover:shadow-lg transition border-l-4 cursor-pointer ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-red-500'
                      }`}
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex gap-2 sm:gap-3">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden relative">
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = getPlaceholderSvg();
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-blue-500 text-white text-[8px] sm:text-xs px-0.5 sm:px-1 rounded">
                              ▶️
                            </div>
                          )}
                          <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 bg-red-500 text-white text-[6px] sm:text-[8px] px-0.5 sm:px-1 rounded">
                            LIVE
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{product.storeName}</p>
                              <h4 className="font-semibold text-xs sm:text-sm truncate">{product.name}</h4>
                            </div>
                            {isDiscounted && (
                              <span className="text-[8px] sm:text-xs bg-red-100 text-red-600 px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                                -{discountPercent}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                            <span className="font-bold text-red-600 text-xs sm:text-sm">${livePrice}</span>
                            {isDiscounted && (
                              <span className="text-[8px] sm:text-xs text-gray-400 line-through">${product.price}</span>
                            )}
                          </div>
                          <div className="text-[8px] sm:text-xs text-gray-400">
                            👁️ {product.viewerCount || 0} watching
                          </div>
                          <button 
                            onClick={(e) => handleAddToCart(product.id, e)}
                            className="w-full mt-1 sm:mt-2 bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-xs hover:bg-red-700 transition min-h-[32px] sm:min-h-[36px]"
                          >
                            Buy Live Deal 🛒
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Link 
              to="/products" 
              className="block text-center text-blue-600 hover:underline text-xs sm:text-sm"
            >
              View all deals →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LivePage;