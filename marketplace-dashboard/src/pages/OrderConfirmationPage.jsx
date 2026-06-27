/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Use environment variable with local fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:8087/api';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) {
      setError('Order ID not found');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching order from:', `${API_BASE_URL}/orders/${orderId}`);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order: ${response.status}`);
      }
      
      const data = await response.json();
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Could not load order details');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading order confirmation...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">{error || 'We could not find your order.'}</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 min-h-[44px] inline-flex items-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-600 text-white px-4 sm:px-8 py-6 sm:py-8 text-center">
            <div className="text-4xl sm:text-5xl mb-3">✅</div>
            <h1 className="text-2xl sm:text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-green-100 mt-2 text-sm sm:text-base">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <p className="text-green-200 text-xs sm:text-sm mt-1">
              Order #{order.orderNumber}
            </p>
          </div>

          {/* Order Details */}
          <div className="p-4 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Order Date</div>
                <div className="font-semibold text-sm sm:text-base">{formatDate(order.createdAt)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Order Status</div>
                <div className={`font-semibold text-sm sm:text-base ${
                  order.status === 'DELIVERED' ? 'text-green-600' :
                  order.status === 'PAID' ? 'text-blue-600' :
                  order.status === 'CANCELLED' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {order.status || 'PENDING'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Payment Status</div>
                <div className={`font-semibold text-sm sm:text-base ${
                  order.paymentStatus === 'COMPLETED' ? 'text-green-600' :
                  order.paymentStatus === 'FAILED' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {order.paymentStatus || 'PENDING'}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm text-gray-500">Total</div>
                <div className="font-semibold text-sm sm:text-base">${order.totalAmount}</div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm sm:text-base">
                {order.shippingAddress ? (
                  (() => {
                    try {
                      const addr = JSON.parse(order.shippingAddress);
                      return (
                        <div>
                          <div>{addr.firstName} {addr.lastName}</div>
                          <div>{addr.address}</div>
                          <div>{addr.city}, {addr.state} {addr.zipCode}</div>
                          {addr.phone && <div>{addr.phone}</div>}
                        </div>
                      );
                    } catch (e) {
                      return <div>{order.shippingAddress}</div>;
                    }
                  })()
                ) : (
                  <div>No shipping address provided</div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">Product</th>
                      <th className="text-left py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">Qty</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">Price</th>
                      <th className="text-right py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-gray-500 text-[10px] sm:text-xs">by {item.storeName}</div>
                        </td>
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">{item.quantity}</td>
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">${item.unitPrice}</td>
                        <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm font-semibold">${item.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t">
                    <tr>
                      <td colSpan="3" className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm font-semibold">Subtotal</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">${order.subtotal}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">Shipping</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">${order.shippingCost}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">Tax</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">${order.taxAmount}</td>
                    </tr>
                    <tr className="font-bold">
                      <td colSpan="3" className="py-2 sm:py-3 px-3 sm:px-4 text-right text-sm sm:text-base">Total</td>
                      <td className="py-2 sm:py-3 px-3 sm:px-4 text-right text-sm sm:text-base">${order.totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-[44px] inline-flex items-center"
              >
                Continue Shopping
              </Link>
              <Link
                to="/order-history"
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 text-sm sm:text-base min-h-[44px] inline-flex items-center"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;