/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Use environment variable with local fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:8087/api';

function Orders() {
  const token = localStorage.getItem('adminToken');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('Fetching orders from:', `${API_BASE_URL}/admin/orders`);
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('Updating order status at:', `${API_BASE_URL}/admin/orders/${orderId}/status`);
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        alert('✅ Order status updated successfully!');
        fetchOrders();
      } else {
        const data = await response.json();
        alert(data.message || '❌ Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Error updating order status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'REFUNDED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchOrders} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 min-h-11">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Orders</h1>
            <p className="text-sm text-gray-500">{orders.length} total orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm min-h-11 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm min-h-9 ${
              filterStatus === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({orders.length})
          </button>
          {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm min-h-9 ${
                  filterStatus === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-base sm:text-lg font-medium mb-2">No orders found</h3>
            <p className="text-sm text-gray-500">
              {filterStatus === 'all' ? 'No orders have been placed yet.' : `No orders with status: ${filterStatus}`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-b flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">
                      Order #{order.orderNumber || order.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status || 'PENDING'}
                    </span>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus || 'PENDING'}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap justify-between items-center gap-2 border-b pb-3 sm:pb-4 last:border-0">
                        <div className="flex-1 min-w-30">
                          <div className="font-semibold text-sm sm:text-base">{item.productName}</div>
                          <div className="text-xs text-gray-500">by {item.storeName}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm sm:text-base">${item.totalPrice}</div>
                          <div className="text-xs text-gray-500">${item.unitPrice} each</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t flex flex-wrap justify-between items-center gap-2">
                    <div className="text-xs text-gray-500">
                      {order.buyerEmail && (
                        <span>Buyer: {order.buyerEmail}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        Subtotal: ${order.subtotal} + Shipping: ${order.shippingCost} + Tax: ${order.taxAmount}
                      </div>
                      <div className="text-lg sm:text-xl font-bold mt-0.5 sm:mt-1">Total: ${order.totalAmount}</div>
                    </div>
                  </div>

                  {/* ✅ ADDED: Buyer Information for Admin */}
                  <div className="mt-3 pt-3 border-t">
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">📦 Buyer Information</h4>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p><span className="font-medium">Name:</span> {order.buyerName || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {order.buyerEmail || 'N/A'}</p>
                      <p><span className="font-medium">Shipping Address:</span></p>
                      <p className="text-xs text-gray-500 pl-2 whitespace-pre-wrap">
                        {order.shippingAddress || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                    <select
                      value={order.status || 'PENDING'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="border rounded px-2 sm:px-3 py-1.5 text-xs sm:text-sm min-h-11"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;