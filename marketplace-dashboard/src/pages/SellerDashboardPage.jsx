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
    status: 'DRAFT'
  });

  const getToken = () => localStorage.getItem('token') || localStorage.getItem('adminToken');

  useEffect(() => {
    if (!user || user.userType !== 'SELLER') {
      return;
    }
    fetchSellerProducts();
    fetchCategories();
    fetchSellerOrders();
  }, [user]);

  const fetchSellerProducts = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/seller/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
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
        alert(editingProduct ? 'Product updated!' : 'Product created!');
        setShowAddForm(false);
        setEditingProduct(null);
        setImageUrls([]);
        setFormData({
          name: '', slug: '', description: '', shortDescription: '',
          price: '', compareAtPrice: '', quantity: '', sku: '',
          categoryId: '', images: '[]', specifications: '{}', status: 'DRAFT'
        });
        fetchSellerProducts();
      } else {
        alert(data.message || 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
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
      if (response.ok) {
        alert('Product deleted');
        fetchSellerProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product) => {
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
      status: product.status
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
        alert('Order status updated!');
        fetchSellerOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const getPlaceholderSvg = (size = 80) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
  };

  if (!user || user.userType !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Seller Access Only</h2>
          <p className="text-gray-600 mb-4">You need to register as a seller to access this page.</p>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Register as Seller</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingProduct(null);
              setImageUrls([]);
              setFormData({
                name: '', slug: '', description: '', shortDescription: '',
                price: '', compareAtPrice: '', quantity: '', sku: '',
                categoryId: '', images: '[]', specifications: '{}', status: 'DRAFT'
              });
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add New Product
          </button>
        </div>

        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            My Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-2 px-4 ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-500'}`}
          >
            Analytics
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {showAddForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Slug *</label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Compare at Price</label>
                      <input
                        type="number"
                        step="0.01"
                        name="compareAtPrice"
                        value={formData.compareAtPrice}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Short Description</label>
                    <input
                      type="text"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="border rounded-lg p-4">
                    <label className="block text-sm font-medium mb-2">Product Images</label>
                    <div className="mb-3">
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
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        📷 {uploading ? 'Uploading...' : 'Upload Images from Computer'}
                      </button>
                      <span className="text-sm text-gray-500 ml-3">(Select multiple images)</span>
                    </div>
                    {imageUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Uploaded images:</p>
                        <div className="flex flex-wrap gap-3">
                          {imageUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={url} 
                                alt={`Product ${index + 1}`} 
                                className="w-20 h-20 object-cover border rounded"
                                onError={(e) => { 
                                  e.target.onerror = null;
                                  e.target.src = getPlaceholderSvg(80);
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
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowAddForm(false);
                        setImageUrls([]);
                      }} 
                      className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
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
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">You haven't listed any products yet.</p>
                  <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4">Image</th>
                        <th className="text-left py-3 px-4">Product</th>
                        <th className="text-left py-3 px-4">Price</th>
                        <th className="text-left py-3 px-4">Stock</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Sales</th>
                        <th className="text-left py-3 px-4">Actions</th>
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
                            <td className="py-3 px-4">
                              {productImage ? (
                                <img 
                                  src={productImage} 
                                  alt={product.name} 
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = getPlaceholderSvg(48);
                                  }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.sku}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">${product.price}</td>
                            <td className="py-3 px-4">{product.quantity}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">{product.salesCount || 0}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button onClick={() => handleEdit(product)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline">Delete</button>
                                <Link to={`/product/${product.id}`} className="text-green-600 hover:underline">View</Link>
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
              <div className="p-8 text-center">
                <p className="text-gray-500">No orders yet for your products.</p>
                <p className="text-sm text-gray-400">When customers buy your products, orders will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Order #</th>
                      <th className="text-left py-3 px-4">Buyer</th>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">Qty</th>
                      <th className="text-left py-3 px-4">Total</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link to={`/order-confirmation/${order.id}`} className="text-blue-600 hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-medium">{order.buyerName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{order.buyerEmail || 'N/A'}</div>
                            {order.shippingAddress && (
                              <div className="text-xs text-gray-500 mt-1">
                                {(() => {
                                  try {
                                    const addr = JSON.parse(order.shippingAddress);
                                    return addr.address || 'N/A';
                                  } catch (e) {
                                    return 'N/A';
                                  }
                                })()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {order.items?.map((item, idx) => (
                              <div key={idx}>{item.productName}</div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {order.items?.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ${order.items?.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Analytics coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerDashboardPage;