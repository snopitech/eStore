/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function PayoutSettingsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    payoutMethod: 'BANK',
    payoutAccountName: '',
    payoutAccountNumber: '',
    payoutRoutingNumber: '',
    payoutPaypalEmail: '',
    payoutEmail: ''
  });

  useEffect(() => {
    if (user && user.userType === 'SELLER') {
      fetchPayoutSettings();
    }
  }, [user]);

  const fetchPayoutSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/seller/payout-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          payoutMethod: data.payoutMethod || 'BANK',
          payoutAccountName: data.payoutAccountName || '',
          payoutAccountNumber: data.payoutAccountNumber || '',
          payoutRoutingNumber: data.payoutRoutingNumber || '',
          payoutPaypalEmail: data.payoutPaypalEmail || '',
          payoutEmail: data.payoutEmail || user?.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching payout settings:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/seller/payout-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage('✅ Payout settings saved successfully!');
        setTimeout(() => {
          navigate('/seller/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(data || '❌ Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving payout settings:', error);
      setMessage('❌ Error saving settings');
    } finally {
      setSaving(false);
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
        <div className="text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6">💰 Payout Settings</h1>
      <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
        Set up your payout method to receive your earnings.
      </p>

      {message && (
        <div className={`p-3 sm:p-4 rounded mb-4 text-sm ${message.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Payout Method *</label>
            <select
              name="payoutMethod"
              value={formData.payoutMethod}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
              required
            >
              <option value="BANK">Bank Transfer</option>
              <option value="PAYPAL">PayPal</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Bank Details</h3>

            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium mb-1">Account Holder Name</label>
              <input
                type="text"
                name="payoutAccountName"
                value={formData.payoutAccountName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required={formData.payoutMethod === 'BANK'}
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium mb-1">Account Number</label>
              <input
                type="text"
                name="payoutAccountNumber"
                value={formData.payoutAccountNumber}
                onChange={handleChange}
                placeholder="1234567890"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required={formData.payoutMethod === 'BANK'}
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium mb-1">Routing Number</label>
              <input
                type="text"
                name="payoutRoutingNumber"
                value={formData.payoutRoutingNumber}
                onChange={handleChange}
                placeholder="021000021"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required={formData.payoutMethod === 'BANK'}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-sm sm:text-base mb-3">PayPal Details</h3>

            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium mb-1">PayPal Email</label>
              <input
                type="email"
                name="payoutPaypalEmail"
                value={formData.payoutPaypalEmail}
                onChange={handleChange}
                placeholder="seller@paypal.com"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required={formData.payoutMethod === 'PAYPAL'}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="mb-3">
              <label className="block text-xs sm:text-sm font-medium mb-1">Contact Email for Payout Notifications</label>
              <input
                type="email"
                name="payoutEmail"
                value={formData.payoutEmail}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base min-h-[48px] font-medium"
          >
            {saving ? 'Saving...' : 'Save Payout Settings'}
          </button>
        </form>
      </div>

      <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
        <p>💡 Your payout information is secure and will only be used to send you your earnings.</p>
        <p className="mt-1">⏳ Payouts are processed within 3-5 business days.</p>
      </div>
    </div>
  );
}

export default PayoutSettingsPage;