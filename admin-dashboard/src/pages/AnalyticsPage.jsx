/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [marketplaceData, setMarketplaceData] = useState(null);
  const [commissionData, setCommissionData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAllAnalytics();
  }, [selectedPeriod]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSalesData(data.salesOverview);
        setRevenueData(data.revenueOverTime);
        setTopProducts(data.topProducts);
        setMarketplaceData(data.salesByMarketplace);
        setCommissionData(data.commissionSummary);
        setCustomerData(data.customerInsights);
        setInventoryData(data.inventoryStatus);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueByPeriod = async (period) => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/revenue?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    fetchRevenueByPeriod(period);
  };

  const getMarketplaceColor = (marketplace) => {
    const colors = {
      'AMAZON': 'text-blue-600',
      'WALMART': 'text-yellow-600',
      'EBAY': 'text-purple-600',
      'TIKTOK': 'text-black',
      'GOOGLE': 'text-green-600',
      'ETSY': 'text-pink-600',
      'ESTORE': 'text-blue-800'
    };
    return colors[marketplace] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">📊 Analytics</h1>
        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => handlePeriodChange('week')}
            className={`px-2 sm:px-3 py-1 rounded text-[10px] sm:text-sm min-h-9 sm:min-h-11 ${
              selectedPeriod === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`px-2 sm:px-3 py-1 rounded text-[10px] sm:text-sm min-h-9 sm:min-h-11 ${
              selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={`px-2 sm:px-3 py-1 rounded text-[10px] sm:text-sm min-h-9 sm:min-h-11 ${
              selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Sales Overview Cards */}
      {salesData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-[10px] sm:text-sm text-gray-500">Total Revenue</div>
            <div className="text-base sm:text-2xl font-bold text-green-600">
              ${salesData.totalRevenue?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-[10px] sm:text-sm text-gray-500">Total Orders</div>
            <div className="text-base sm:text-2xl font-bold text-blue-600">
              {salesData.totalOrders || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-[10px] sm:text-sm text-gray-500">Avg Order Value</div>
            <div className="text-base sm:text-2xl font-bold text-purple-600">
              ${salesData.averageOrderValue?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-[10px] sm:text-sm text-gray-500">Growth</div>
            <div className={`text-base sm:text-2xl font-bold ${salesData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {salesData.growth >= 0 ? '↑' : '↓'} {Math.abs(salesData.growth)}%
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Revenue Chart */}
        {revenueData && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">📈 Revenue Over Time</h3>
            <div className="h-48 sm:h-64">
              <div className="flex items-end h-36 sm:h-48 gap-0.5 sm:gap-1">
                {revenueData.labels?.map((label, index) => {
                  const maxRevenue = Math.max(...(revenueData.revenue || [1]));
                  const height = maxRevenue > 0 ? (revenueData.revenue[index] / maxRevenue * 100) : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t min-h-1"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      ></div>
                      <span className="text-[8px] sm:text-xs text-gray-500 mt-1 truncate w-full text-center">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Sales by Marketplace */}
        {marketplaceData && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">🌐 Sales by Marketplace</h3>
            <div className="space-y-2 sm:space-y-3">
              {marketplaceData.marketplaces?.map((item) => {
                const percentage = marketplaceData.totalRevenue > 0
                  ? (item.revenue / marketplaceData.totalRevenue * 100)
                  : 0;
                return (
                  <div key={item.marketplace}>
                    <div className="flex justify-between text-[10px] sm:text-sm">
                      <span className={getMarketplaceColor(item.marketplace)}>
                        {item.marketplace}
                      </span>
                      <span>${item.revenue?.toFixed(2) || '0.00'} ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">🏆 Top Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">No products found.</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="font-bold text-gray-400 text-xs sm:text-sm">#{index + 1}</span>
                    <div className="min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">{product.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500 truncate">{product.storeName}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-xs sm:text-sm">${product.price}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">{product.salesCount} sales</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commission Summary */}
        {commissionData && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">💰 Commission Summary</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-green-50 rounded p-2 sm:p-3 text-center">
                <div className="text-[10px] sm:text-sm text-gray-500">Total</div>
                <div className="text-base sm:text-xl font-bold text-green-600">
                  ${commissionData.totalCommission?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="bg-yellow-50 rounded p-2 sm:p-3 text-center">
                <div className="text-[10px] sm:text-sm text-gray-500">Pending</div>
                <div className="text-base sm:text-xl font-bold text-yellow-600">
                  ${commissionData.totalPending?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="bg-blue-50 rounded p-2 sm:p-3 text-center">
                <div className="text-[10px] sm:text-sm text-gray-500">Paid</div>
                <div className="text-base sm:text-xl font-bold text-blue-600">
                  ${commissionData.totalPaid?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div className="bg-purple-50 rounded p-2 sm:p-3 text-center">
                <div className="text-[10px] sm:text-sm text-gray-500">Pending Orders</div>
                <div className="text-base sm:text-xl font-bold text-purple-600">
                  {commissionData.pendingCount || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Customer Insights */}
        {customerData && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">👥 Customer Insights</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{customerData.totalCustomers || 0}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{customerData.repeatCustomers || 0}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Repeat</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">{customerData.repeatRate || 0}%</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Status */}
        {inventoryData && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">📦 Inventory Status</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{inventoryData.totalProducts || 0}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{inventoryData.activeProducts || 0}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-600">{inventoryData.outOfStock || 0}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Out of Stock</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-yellow-600">{inventoryData.lowStock || 0}</div>
                <div className="text-[10px] sm:text-sm text-gray-500">Low Stock</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;