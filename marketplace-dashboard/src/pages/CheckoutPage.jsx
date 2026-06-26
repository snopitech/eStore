/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  useStripe,
  useElements,
  CardElement,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const API_BASE_URL = 'http://localhost:8087/api';

// Your LIVE publishable key
const stripePromise = loadStripe('pk_live_51TkTGpB8QOHyNrOICoA47jjjbsjNKiwlfJb5FgVaQvqJczwzBRwCHPqFAGq2oBQzZ6gPLMOEo5al5TBB4w7itUwS00bzkAknW3');

function CheckoutForm() {
  const { cartItems, cartCount, clearCart } = useCart();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // STEP 1: Create order and get client secret
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create order
      const orderResponse = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            phone: formData.phone
          }),
          billingAddress: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          }),
          paymentMethod: 'STRIPE',
          notes: ''
        })
      });
      
      const order = await orderResponse.json();
      
      if (!order.id) {
        throw new Error('Failed to create order');
      }
      
      setOrderId(order.id);

      // 2. Create payment intent
      const paymentResponse = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          orderId: order.id
        })
      });
      
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(errorText || 'Failed to create payment');
      }
      
      const payment = await paymentResponse.json();
      
      if (!payment.clientSecret) {
        throw new Error('No clientSecret returned from server');
      }
      
      setClientSecret(payment.clientSecret);
      setShowCardForm(true);
      setLoading(false);

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // STEP 2: Process payment with Stripe
  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!stripe || !elements) {
      setError('Stripe is not ready. Please try again.');
      return;
    }

    setProcessingPayment(true);

    const cardElement = elements.getElement(CardElement);
    
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: {
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            country: 'US'
          }
        }
      }
    });

    if (stripeError) {
      console.error('Stripe error:', stripeError);
      setError(stripeError.message);
      setProcessingPayment(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      try {
        await fetch(`${API_BASE_URL}/orders/${orderId}/payment-success`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Error updating order:', err);
      }

      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Arial, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Checkout</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Checkout Form - Mobile Friendly */}
          <div className="flex-1">
            <form className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                  />
                </div>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                />
              </div>
              
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                  />
                </div>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                />
              </div>

              {/* Stripe Card Form */}
              {showCardForm ? (
                <div className="mt-4 sm:mt-6 border-t pt-4 sm:pt-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Payment Information</h3>
                  <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <CardElement options={cardElementOptions} />
                  </div>
                  <button
                    type="button"
                    onClick={handlePayment}
                    disabled={!stripe || processingPayment}
                    className="w-full mt-3 sm:mt-4 bg-yellow-500 text-gray-900 py-3 rounded-md font-semibold hover:bg-yellow-400 transition disabled:opacity-50 text-sm sm:text-base min-h-[48px]"
                  >
                    {processingPayment ? 'Processing Payment...' : `Pay $${total.toFixed(2)}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCardForm(false)}
                    className="w-full mt-2 text-gray-500 text-xs sm:text-sm hover:text-gray-700 min-h-[44px]"
                  >
                    ← Back
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-yellow-500 text-gray-900 py-3 rounded-md font-semibold hover:bg-yellow-400 transition disabled:opacity-50 text-sm sm:text-base min-h-[48px]"
                >
                  {loading ? 'Creating Order...' : `Place Order • $${total.toFixed(2)}`}
                </button>
              )}
              
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
          
          {/* Order Summary - Mobile Friendly */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4">
              <h2 className="text-base sm:text-xl font-bold mb-3 sm:mb-4">Order Summary</h2>
              
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto mb-3 sm:mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-gray-500"> x{item.quantity}</span>
                    </div>
                    <span>${(item.priceAtAdd * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3 space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Estimated Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Secure payment with Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with Elements provider
function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

export default CheckoutPage;