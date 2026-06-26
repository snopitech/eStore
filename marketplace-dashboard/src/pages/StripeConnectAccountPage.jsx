/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function StripeConnectAccountPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    businessType: 'individual'
  });

  useEffect(() => {
    if (user && user.userType === 'SELLER') {
      fetchConnectStatus();
    }
  }, [user]);

  const fetchConnectStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/connect/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error fetching connect status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setConnecting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/connect/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          phone: formData.phone,
          businessType: formData.businessType
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.accountLinkUrl) {
          window.location.href = data.accountLinkUrl;
        } else {
          setMessage('✅ Stripe Connect account created! Please complete the onboarding process.');
        }
      } else {
        setMessage('❌ ' + (data.message || 'Failed to create Stripe Connect account'));
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      setMessage('❌ Error connecting to Stripe');
    } finally {
      setConnecting(false);
    }
  };

  if (!user || user.userType !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Seller Access Only</h2>
          <Link to="/login" className="text-blue-600 hover:underline text-sm sm:text-base min-h-[44px] inline-flex items-center">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Check if already connected
  if (status && status.status === 'ACTIVE' && status.verified) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">✅</div>
          <h2 className="text-xl sm:text-2xl font-bold text-green-700 mb-2">Stripe Connect is Active!</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Your Stripe Connect account is verified and ready to receive payouts.
          </p>
          <div className="mt-4 text-xs sm:text-sm text-gray-500 space-y-1">
            <p>Account ID: <span className="font-mono">{status.accountId}</span></p>
            <p>Status: <span className="font-medium">{status.status}</span></p>
            <p>Payouts Enabled: {status.payoutsEnabled ? '✅ Yes' : '❌ No'}</p>
          </div>
          <Link 
            to="/seller/dashboard" 
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base min-h-[48px]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6">💳 Stripe Connect</h1>
      <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
        Connect your Stripe account to receive payouts automatically when customers make purchases.
      </p>

      {message && (
        <div className={`p-3 sm:p-4 rounded-lg mb-4 text-sm ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}

      {status && status.status === 'PENDING' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-700 text-sm sm:text-base">⏳ Your Stripe Connect account is pending verification.</p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="mt-3 bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm min-h-[48px]"
          >
            {connecting ? 'Processing...' : 'Continue Onboarding'}
          </button>
        </div>
      )}

      {(!status || status.status === 'NOT_SETUP') && (
        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-7">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Connect Your Stripe Account</h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5">
            This will allow you to receive automatic payouts for your sales.
          </p>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Your store name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[48px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[48px]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={connecting}
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base font-medium min-h-[52px] transition"
            >
              {connecting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect with Stripe'
              )}
            </button>
          </form>
        </div>
      )}

      <div className="mt-5 sm:mt-7 space-y-2 text-xs sm:text-sm text-gray-500">
        <p className="flex items-start gap-2">
          <span className="text-blue-500">💡</span>
          <span>Stripe Connect allows you to receive payouts directly to your bank account.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-blue-500">⏳</span>
          <span>Verification may take 1-2 business days.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-blue-500">🔒</span>
          <span>Your information is secure and encrypted.</span>
        </p>
      </div>
    </div>
  );
}

export default StripeConnectAccountPage;