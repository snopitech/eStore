/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8087/api';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Order Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline text-sm sm:text-base">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 sm:py-12">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center mb-4 sm:mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Your order has been placed successfully. Order #{order.orderNumber}
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Order Details</h2>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <div className="text-xs sm:text-sm text-gray-500">Order Number</div>
              <div className="font-semibold text-sm sm:text-base">{order.orderNumber}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-500">Order Date</div>
              <div className="font-semibold text-sm sm:text-base">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-500">Payment Status</div>
              <div className="font-semibold text-sm sm:text-base text-green-600">{order.paymentStatus}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-500">Order Status</div>
              <div className="font-semibold text-sm sm:text-base">{order.status}</div>
            </div>
          </div>

          <h3 className="font-semibold text-sm sm:text-base mb-3">Items</h3>
          <div className="space-y-3 mb-4 sm:mb-6">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b pb-3">
                <div>
                  <div className="font-medium text-sm sm:text-base">{item.productName}</div>
                  <div className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</div>
                </div>
                <div className="font-semibold text-sm sm:text-base">${item.totalPrice}</div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm sm:text-base">
              <span>Subtotal</span>
              <span>${order.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span>Shipping</span>
              <span>${order.shippingCost}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span>Tax</span>
              <span>${order.taxAmount}</span>
            </div>
            <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>${order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Shipping Address</h2>
          <div className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
            {order.shippingAddress}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link to="/" className="flex-1 bg-blue-600 text-white py-3 rounded-md text-center font-semibold hover:bg-blue-700 text-sm sm:text-base min-h-[48px] flex items-center justify-center">
            Continue Shopping
          </Link>
          <Link to="/order-history" className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-md text-center font-semibold hover:bg-blue-50 text-sm sm:text-base min-h-[48px] flex items-center justify-center">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;