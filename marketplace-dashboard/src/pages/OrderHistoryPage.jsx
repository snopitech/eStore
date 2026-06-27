/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Use environment variable with local fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:8087/api';

function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from:', `${API_BASE_URL}/orders`);
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      console.log('Cancelling order at:', `${API_BASE_URL}/orders/${orderId}/cancel`);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Order cancelled successfully');
        fetchOrders();
      } else {
        alert(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">My Orders</h1>
          <Link to="/" className="text-blue-600 hover:underline text-sm sm:text-base">
            Continue Shopping →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm sm:text-base min-h-[44px] inline-flex items-center">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-b flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-500 font-medium">Order #{order.orderNumber}</div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                      order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap justify-between items-center gap-2 border-b pb-3 sm:pb-4 last:border-0">
                        <div className="flex-1 min-w-[120px]">
                          <div className="font-semibold text-sm sm:text-base">{item.productName}</div>
                          <div className="text-xs sm:text-sm text-gray-500">by {item.storeName}</div>
                          <div className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</div>
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
                    <div className="text-xs sm:text-sm text-gray-500">
                      {order.shippingAddress ? 
                        `Shipping to: ${(() => {
                          try {
                            const addr = JSON.parse(order.shippingAddress);
                            return addr.address || 'N/A';
                          } catch (e) {
                            return 'N/A';
                          }
                        })()}` 
                        : 'N/A'
                      }
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Subtotal: ${order.subtotal} + Shipping: ${order.shippingCost} + Tax: ${order.taxAmount}
                      </div>
                      <div className="text-lg sm:text-xl font-bold mt-0.5 sm:mt-1">Total: ${order.totalAmount}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="text-blue-600 hover:underline text-xs sm:text-sm min-h-[44px] flex items-center"
                    >
                      View Details
                    </Link>
                    {order.status === 'PAID' && (
                      <button className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm min-h-[44px]">
                        Track Order
                      </button>
                    )}
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm min-h-[44px]"
                      >
                        Cancel Order
                      </button>
                    )}
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

export default OrderHistoryPage;