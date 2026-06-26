/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function CommissionSummaryPage() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState({
    pendingAmount: 0,
    paidAmount: 0,
    totalAmount: 0,
    pendingCount: 0
  });
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payoutLoading, setPayoutLoading] = useState(false);

  useEffect(() => {
    if (user && user.userType === 'SELLER') {
      fetchSummary();
      fetchCommissions();
    }
  }, [user]);

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commissions/my-summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchCommissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commissions/my-commissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCommissions(data.commissions || []);
      }
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    if (summary.pendingCount === 0) {
      alert('You have no pending commissions to payout.');
      return;
    }

    if (!window.confirm(`Request payout for $${summary.pendingAmount.toFixed(2)}?`)) {
      return;
    }

    setPayoutLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/commissions/request-payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert('✅ Payout requested successfully!');
        fetchSummary();
        fetchCommissions();
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
        <div className="text-xl">Loading earnings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">💰 My Earnings</h1>

      {/* Stats - Mobile friendly */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="text-[10px] sm:text-sm text-gray-500">Total Earnings</div>
          <div className="text-base sm:text-2xl font-bold text-blue-600">
            ${summary.totalAmount.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="text-[10px] sm:text-sm text-gray-500">Pending</div>
          <div className="text-base sm:text-2xl font-bold text-yellow-600">
            ${summary.pendingAmount.toFixed(2)}
            <span className="text-[8px] sm:text-sm font-normal text-gray-400 ml-1">
              ({summary.pendingCount})
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="text-[10px] sm:text-sm text-gray-500">Paid</div>
          <div className="text-base sm:text-2xl font-bold text-green-600">
            ${summary.paidAmount.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-3 sm:p-6">
          <div className="text-[10px] sm:text-sm text-gray-500">Commission Rate</div>
          <div className="text-base sm:text-2xl font-bold text-purple-600">5%</div>
          <div className="text-[8px] sm:text-xs text-gray-400">On every sale</div>
        </div>
      </div>

      {/* Payout - Mobile friendly */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <h3 className="font-semibold text-sm sm:text-base">Request Payout</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            Pending: <strong>${summary.pendingAmount.toFixed(2)}</strong>
          </p>
        </div>
        <button
          onClick={requestPayout}
          disabled={payoutLoading || summary.pendingCount === 0}
          className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base min-h-[44px] w-full sm:w-auto"
        >
          {payoutLoading ? 'Processing...' : 'Request Payout'}
        </button>
      </div>

      {/* History - Mobile friendly */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-sm sm:text-base">Commission History</h3>
        </div>
        {commissions.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500 text-sm sm:text-base">
            No commissions yet. Start selling to earn!
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="text-xs sm:text-sm">{c.order?.orderNumber || 'N/A'}</td>
                    <td className="text-xs sm:text-sm">{c.product?.name || 'N/A'}</td>
                    <td className="text-xs sm:text-sm">${c.order?.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td className="font-medium text-blue-600 text-xs sm:text-sm">
                      ${c.commissionAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[8px] sm:text-xs ${
                        c.status === 'PAID' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {c.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="text-xs sm:text-sm text-gray-500">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommissionSummaryPage;