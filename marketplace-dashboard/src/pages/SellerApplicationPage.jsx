/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function SellerApplicationPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    address: '',
    goodsToSell: '',
    businessName: '',
    businessAddress: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // If already a seller, redirect to dashboard
  useEffect(() => {
    if (user && user.userType === 'SELLER') {
      navigate('/seller/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/seller/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: '✅ Your application has been submitted successfully! Please wait for admin approval.' 
        });
        setFormData({
          phoneNumber: '',
          address: '',
          goodsToSell: '',
          businessName: '',
          businessAddress: ''
        });
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data || '❌ Something went wrong. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Application error:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Failed to submit application. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">You need to login first to apply as a seller.</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-[44px]"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 md:py-12">
      <div className="max-w-3xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Become a Seller</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Fill out the form below to apply to become a seller on eStore.</p>

          {message.text && (
            <div className={`p-3 sm:p-4 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                placeholder="Enter your full address"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">What goods do you intend to sell? *</label>
              <textarea
                name="goodsToSell"
                value={formData.goodsToSell}
                onChange={handleChange}
                required
                rows="3"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                placeholder="Describe the products you want to sell"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Business Name (Optional)</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                placeholder="Enter your business name"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Business Address (Optional)</label>
              <input
                type="text"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                placeholder="Enter your business address"
              />
            </div>

            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base min-h-[48px]"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellerApplicationPage;