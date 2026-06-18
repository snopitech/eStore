/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.getStats(token);
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-blue-500' },
    { label: 'Buyers', value: stats?.totalBuyers || 0, color: 'bg-green-500' },
    { label: 'Sellers', value: stats?.totalSellers || 0, color: 'bg-purple-500' },
    { label: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-orange-500' },
    { label: 'Active Products', value: stats?.activeProducts || 0, color: 'bg-teal-500' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, color: 'bg-pink-500' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, color: 'bg-yellow-500' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`, color: 'bg-red-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-75`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;