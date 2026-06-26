/* eslint-disable no-empty */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-useless-assignment */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function SellerDashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sellerStatus, setSellerStatus] = useState({ isActive: true, isApproved: true });
  const [liveStatus, setLiveStatus] = useState({ isLive: false, liveProduct: null });
  const [commissionSummary, setCommissionSummary] = useState({
    pendingAmount: 0,
    paidAmount: 0,
    totalAmount: 0,
    pendingCount: 0
  });
  const [commissions, setCommissions] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: '',
    compareAtPrice: '',
    quantity: '',
    sku: '',
    categoryId: '',
    images: '[]',
    specifications: '{}',
    status: 'ACTIVE'
  });

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken');

  useEffect(() => {
    if (!user || user.userType !== 'SELLER') {
      return;
    }
    fetchSellerProducts();
    fetchCategories();
    fetchSellerOrders();
    fetchSellerStatus();
    checkLiveStatus();
    fetchCommissionSummary();
    fetchMyCommissions();
  }, [user]);

  // ===== FETCH FUNCTIONS =====
  const fetchCommissionSummary = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/commissions/my-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCommissionSummary(data);
      }
    } catch (error) {
      console.error('Error fetching commission summary:', error);
    }
  };

  const fetchMyCommissions = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/commissions/my-commissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions || []);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  const requestPayout = async () => {
    if (commissionSummary.pendingCount === 0) {
      alert('You have no pending commissions to payout.');
      return;
    }

    if (!window.confirm(`Are you sure you want to request payout for $${commissionSummary.pendingAmount.toFixed(2)}?`)) {
      return;
    }

    setPayoutLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/commissions/request-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert('✅ Payout requested successfully!');
        fetchCommissionSummary();
        fetchMyCommissions();
      } else {
        const data = await response.json();
        alert(data || 'Failed to request payout');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Error requesting payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const fetchSellerStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/seller/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSellerStatus({
          isActive: data.isActive !== undefined ? data.isActive : true,
          isApproved: data.isApproved !== undefined ? data.isApproved : true
        });
      }
    } catch (error) {
      console.error('Error fetching seller status:', error);
    }
  };

  const checkLiveStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/seller/live/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setLiveStatus({
          isLive: data.isLive || false,
          liveProduct: data.liveProduct || null
        });
      }
    } catch (error) {
      console.error('Error checking live status:', error);
    }
  };

  const startLiveStream = async (productId, livePrice) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/seller/products/${productId}/go-live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ livePrice: livePrice || null })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('🚀 Live stream started!');
        checkLiveStatus();
        fetchSellerProducts();
      } else {
        alert(data.error || 'Failed to start live stream');
      }
    } catch (error) {
      console.error('Error starting live stream:', error);
      alert('Error starting live stream');
    }
  };

  const endLiveStream = async (productId) => {
    if (!window.confirm('Are you sure you want to end this live stream?')) return;
    
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/seller/products/${productId}/end-live`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('📺 Live stream ended');
        checkLiveStatus();
        fetchSellerProducts();
      } else {
        alert(data.error || 'Failed to end live stream');
      }
    } catch (error) {
      console.error('Error ending live stream:', error);
      alert('Error ending live stream');
    }
  };

  const handleGoLive = (product) => {
    const livePrice = prompt(
      `Enter live price for "${product.name}" (leave blank for same price):`,
      product.price
    );
    if (livePrice === null) return;
    
    const price = livePrice.trim() ? parseFloat(livePrice) : null;
    if (price !== null && (isNaN(price) || price <= 0)) {
      alert('Please enter a valid price');
      return;
    }
    
    startLiveStream(product.id, price);
  };

  const fetchSellerProducts = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/seller/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      if (data.products) {
        setProducts(Array.isArray(data.products) ? data.products : []);
        if (data.isActive !== undefined) {
          setSellerStatus(prev => ({ ...prev, isActive: data.isActive }));
        }
        if (data.isApproved !== undefined) {
          setSellerStatus(prev => ({ ...prev, isApproved: data.isApproved }));
        }
      } else {
        setProducts(Array.isArray(data) ? data : []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchSellerOrders = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/orders/seller/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setOrdersLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setOrdersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    
    for (const file of files) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: uploadFormData
        });
        
        const data = await response.json();
        if (data.url) {
          const newUrls = [...imageUrls, data.url];
          setImageUrls(newUrls);
          setFormData({ ...formData, images: JSON.stringify(newUrls) });
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image: ' + error.message);
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setFormData({ ...formData, images: JSON.stringify(newUrls) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sellerStatus.isActive) {
      alert('❌ Your seller account has been disabled.');
      return;
    }
    
    if (!sellerStatus.isApproved) {
      alert('❌ Your seller account is not approved.');
      return;
    }
    
    try {
      const token = getToken();
      const url = editingProduct 
        ? `${API_BASE_URL}/seller/products/${editingProduct.id}`
        : `${API_BASE_URL}/seller/products`;
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : null,
          quantity: parseInt(formData.quantity),
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          images: formData.images
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(editingProduct ? '✅ Product updated!' : '✅ Product created!');
        setShowAddForm(false);
        setEditingProduct(null);
        setImageUrls([]);
        setFormData({
          name: '', slug: '', description: '', shortDescription: '',
          price: '', compareAtPrice: '', quantity: '', sku: '',
          categoryId: '', images: '[]', specifications: '{}', status: 'ACTIVE'
        });
        fetchSellerProducts();
      } else {
        const errorMessage = data.error || data.message || 'Error saving product';
        alert(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('❌ Error saving product. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/seller/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('✅ Product deleted successfully');
        fetchSellerProducts();
      } else {
        alert(`❌ ${data.error || 'Failed to delete product'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Error deleting product');
    }
  };

  const handleEdit = (product) => {
    if (!sellerStatus.isActive) {
      alert('❌ Your seller account has been disabled.');
      return;
    }
    
    setEditingProduct(product);
    let images = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch (e) {
      images = [];
    }
    setImageUrls(images);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      quantity: product.quantity,
      sku: product.sku || '',
      categoryId: product.categoryId || '',
      images: product.images || '[]',
      specifications: product.specifications || '{}',
      status: product.status || 'ACTIVE'
    });
    setShowAddForm(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        alert('✅ Order status updated!');
        fetchSellerOrders();
      } else {
        const data = await response.json();
        alert(`❌ ${data.error || 'Failed to update order status'}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Error updating order status');
    }
  };

  const getPlaceholderSvg = (size = 80) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
  };

  if (!user || user.userType !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Seller Access Only</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">You need to register as a seller to access this page.</p>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded min-h-[44px] inline-flex items-center">
            Register as Seller
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Seller Dashboard</h1>
            {!sellerStatus.isActive && (
              <div className="mt-2 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 rounded text-sm">
                ⚠️ Your seller account has been <strong>DISABLED</strong>
              </div>
            )}
            {!sellerStatus.isApproved && sellerStatus.isActive && (
              <div className="mt-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 sm:px-4 py-2 rounded text-sm">
                ⏳ Your seller account is <strong>PENDING APPROVAL</strong>
              </div>
            )}
            {sellerStatus.isActive && sellerStatus.isApproved && (
              <div className="mt-2 bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 rounded text-sm">
                ✅ Your seller account is <strong>ACTIVE</strong>
              </div>
            )}
          </div>
          {sellerStatus.isActive && sellerStatus.isApproved && (
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingProduct(null);
                setImageUrls([]);
                setFormData({
                  name: '', slug: '', description: '', shortDescription: '',
                  price: '', compareAtPrice: '', quantity: '', sku: '',
                  categoryId: '', images: '[]', specifications: '{}', status: 'ACTIVE'
                });
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm min-h-[44px] w-full sm:w-auto"
            >
              + Add New Product
            </button>
          )}
        </div>

        {/* Live Status */}
        {liveStatus.isLive && (
          <div className="mb-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></span>
              <span className="font-semibold text-sm sm:text-base">🔴 You are LIVE!</span>
              <span className="text-xs sm:text-sm opacity-75">
                {liveStatus.liveProduct?.name} - 👁️ {liveStatus.liveProduct?.viewerCount || 0}
              </span>
            </div>
            <Link 
              to="/live" 
              className="bg-white text-red-600 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 min-h-[44px] flex items-center"
            >
              View Live Stream →
            </Link>
          </div>
        )}

        {/* Tabs - Scrollable on mobile */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap min-h-[44px] ${
              activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap min-h-[44px] ${
              activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`pb-2 px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap min-h-[44px] ${
              activeTab === 'earnings' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'
            }`}
          >
            💰 Earnings
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 px-3 sm:px-4 text-sm sm:text-base whitespace-nowrap min-h-[44px] ${
              activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {showAddForm && !sellerStatus.isActive && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 text-sm">
                ❌ Your seller account is disabled.
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setImageUrls([]);
                  }}
                  className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm min-h-[44px]"
                >
                  Close
                </button>
              </div>
            )}
            
            {showAddForm && sellerStatus.isActive && sellerStatus.isApproved && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Compare at Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="compareAtPrice"
                        value={formData.compareAtPrice}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Category</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Short Description</label>
                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Full Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm min-h-[100px]"
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <label className="block text-xs sm:text-sm font-medium mb-2">Product Images</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('imageUpload').click()}
                        disabled={uploading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm min-h-[44px]"
                      >
                        📷 {uploading ? 'Uploading...' : 'Upload Images'}
                      </button>
                      <span className="text-xs text-gray-500 flex items-center">(Select multiple)</span>
                    </div>
                    {imageUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {imageUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={url} 
                              alt={`Product ${index + 1}`} 
                              className="w-16 h-16 object-cover border rounded"
                              onError={(e) => { 
                                e.target.onerror = null;
                                e.target.src = getPlaceholderSvg(64);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImageUrl(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm min-h-[44px]">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowAddForm(false);
                        setImageUrls([]);
                      }} 
                      className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 text-sm min-h-[44px]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <p className="text-gray-500 mb-4 text-sm sm:text-base">You haven't listed any products yet.</p>
                  {sellerStatus.isActive && sellerStatus.isApproved && (
                    <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm min-h-[44px]">
                      Add Your First Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] sm:min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Image</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Product</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Price</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Stock</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Sales</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => {
                        let productImage = null;
                        try {
                          const images = product.images ? JSON.parse(product.images) : [];
                          productImage = images[0];
                        } catch (e) {}
                        return (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              {productImage ? (
                                <img 
                                  src={productImage} 
                                  alt={product.name} 
                                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getPlaceholderSvg(40);
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div>
                                <div className="font-semibold text-xs sm:text-sm">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.sku}</div>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">${product.price}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{product.quantity}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {product.status || 'DRAFT'}
                              </span>
                              {product.isLive && (
                                <span className="ml-1 px-2 py-1 rounded text-xs bg-red-100 text-red-800 animate-pulse">
                                  🔴 LIVE
                                </span>
                              )}
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">{product.salesCount || 0}</td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {sellerStatus.isActive && sellerStatus.isApproved && product.quantity > 0 && (
                                  product.isLive ? (
                                    <button
                                      onClick={() => endLiveStream(product.id)}
                                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 min-h-[32px]"
                                    >
                                      End Live
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleGoLive(product)}
                                      className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 animate-pulse min-h-[32px]"
                                    >
                                      Go Live
                                    </button>
                                  )
                                )}
                                <button onClick={() => handleEdit(product)} className="text-blue-600 hover:underline text-xs min-h-[32px]">Edit</button>
                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline text-xs min-h-[32px]">Delete</button>
                                <Link to={`/product/${product.id}`} className="text-green-600 hover:underline text-xs min-h-[32px]">View</Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {ordersLoading ? (
              <div className="p-8 text-center">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <p className="text-gray-500 text-sm sm:text-base">No orders yet for your products.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] sm:min-w-[800px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Order #</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Buyer</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Product</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Qty</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Total</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Status</th>
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                          <Link to={`/order-confirmation/${order.id}`} className="text-blue-600 hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                          <div className="font-medium">{order.buyerName || 'N/A'}</div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                          {order.items?.map((item, idx) => (
                            <div key={idx}>{item.productName}</div>
                          ))}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold">
                          ${order.items?.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <select
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="border rounded px-2 py-1 text-xs sm:text-sm min-h-[44px]"
                            defaultValue={order.status || 'PENDING'}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Total Earnings</div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  ${commissionSummary.totalAmount.toFixed(2)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Pending</div>
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                  ${commissionSummary.pendingAmount.toFixed(2)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Paid</div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  ${commissionSummary.paidAmount.toFixed(2)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Commission Rate</div>
                <div className="text-lg sm:text-2xl font-bold text-purple-600">5%</div>
              </div>
            </div>

            {/* Payout Button */}
            <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-sm sm:text-base">Request Payout</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  Pending: <strong>${commissionSummary.pendingAmount.toFixed(2)}</strong> ({commissionSummary.pendingCount} orders)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/seller/connect"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm min-h-[44px] flex items-center"
                >
                  💳 Connect
                </Link>
                <button
                  onClick={requestPayout}
                  disabled={payoutLoading || commissionSummary.pendingCount === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm min-h-[44px]"
                >
                  {payoutLoading ? 'Processing...' : `Payout $${commissionSummary.pendingAmount.toFixed(2)}`}
                </button>
              </div>
            </div>

            {/* Commission History */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-sm sm:text-base">Commission History</h3>
              </div>
              {commissions.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500 text-sm">No commissions yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] sm:min-w-[700px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Order</th>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Product</th>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Amount</th>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Commission</th>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 px-2 sm:px-4 text-xs sm:text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((commission) => (
                        <tr key={commission.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">{commission.order?.orderNumber || 'N/A'}</td>
                          <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm">{commission.product?.name || 'N/A'}</td>
                          <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium">${commission.order?.totalAmount?.toFixed(2) || '0.00'}</td>
                          <td className="py-2 px-2 sm:px-4 text-xs sm:text-sm font-medium text-blue-600">${commission.commissionAmount?.toFixed(2) || '0.00'}</td>
                          <td className="py-2 px-2 sm:px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              commission.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {commission.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="py-2 px-2 sm:px-4 text-xs text-gray-500">
                            {commission.createdAt ? new Date(commission.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
            <p className="text-gray-500 text-sm sm:text-base">Analytics coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboardPage;