/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Use environment variable with local fallback for development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:8087/api';

function AdminDashboardPage() {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser'));
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || user.userType !== 'ADMIN') {
      return;
    }
    fetchStats();
    fetchUsers();
    fetchProducts();
    fetchOrders();
    fetchSellers();
    fetchApplications();
    fetchEmployees();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sellers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const adminUsers = data.filter(u => u.userType === 'ADMIN');
      setEmployees(adminUsers);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (response.ok) {
        alert('User role updated!');
        fetchUsers();
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Product deleted');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const approveApplication = async (applicationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Application approved! User is now a seller.');
        fetchApplications();
        fetchSellers();
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const rejectApplication = async (applicationId) => {
    const reason = prompt('Enter reason for rejection:');
    if (reason === null) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        alert('Application rejected.');
        fetchApplications();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to reject');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const blockSeller = async (sellerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/block`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Seller blocked successfully');
        fetchSellers();
      }
    } catch (error) {
      console.error('Error blocking seller:', error);
    }
  };

  const approveSeller = async (sellerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Seller approved successfully');
        fetchSellers();
      }
    } catch (error) {
      console.error('Error approving seller:', error);
    }
  };

  const disableSeller = async (sellerId) => {
    if (!window.confirm('Are you sure you want to DISABLE this seller?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/disable`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Seller disabled successfully.');
        fetchSellers();
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to disable seller');
      }
    } catch (error) {
      console.error('Error disabling seller:', error);
      alert('Error disabling seller');
    }
  };

  const enableSeller = async (sellerId) => {
    if (!window.confirm('Are you sure you want to ENABLE this seller?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/enable`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Seller enabled successfully.');
        fetchSellers();
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to enable seller');
      }
    } catch (error) {
      console.error('Error enabling seller:', error);
      alert('Error enabling seller');
    }
  };

  const removeSeller = async (sellerId) => {
    if (!window.confirm('⚠️ WARNING: Are you sure you want to REMOVE this seller?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/remove`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Seller removed successfully.');
        fetchSellers();
        fetchStats();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to remove seller');
      }
    } catch (error) {
      console.error('Error removing seller:', error);
      alert('Error removing seller');
    }
  };

  // ===== APP CARD COMPONENT =====
  const AppCard = ({ title, description, icon, link, color, comingSoon = false }) => (
    <Link 
      to={link} 
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border-l-4 hover:scale-[1.02]"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="text-2xl sm:text-3xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg flex flex-wrap items-center gap-2">
            {title}
            {comingSoon && (
              <span className="text-[10px] sm:text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Soon</span>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>
          <span className="text-xs text-blue-600 mt-2 inline-block hover:underline">
            {comingSoon ? 'Coming Soon →' : 'Open →'}
          </span>
        </div>
      </div>
    </Link>
  );

  if (!user || user.userType !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Admin Access Only</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded text-sm sm:text-base min-h-11 inline-flex items-center">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

        {/* Stats Cards - Mobile friendly */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-[10px] sm:text-sm text-gray-500">Total Users</div>
              <div className="text-lg sm:text-2xl font-bold">{stats.totalUsers}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-[10px] sm:text-sm text-gray-500">Total Products</div>
              <div className="text-lg sm:text-2xl font-bold">{stats.totalProducts}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-[10px] sm:text-sm text-gray-500">Total Orders</div>
              <div className="text-lg sm:text-2xl font-bold">{stats.totalOrders}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-3 sm:p-4">
              <div className="text-[10px] sm:text-sm text-gray-500">Revenue</div>
              <div className="text-lg sm:text-2xl font-bold">${stats.totalRevenue?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        )}

        {/* Tabs - Scrollable on mobile */}
        <div className="flex gap-1 sm:gap-3 mb-4 sm:mb-6 border-b overflow-x-auto hide-scrollbar pb-0.5">
          {['overview', 'employees', 'sellers', 'buyers', 'applications', 'products', 'orders', 'inventory-sources', 'marketplace', 'analytics', 'apps'].map((tab) => {
            const labels = {
              overview: 'Overview',
              employees: `Employees (${employees.length})`,
              sellers: `Sellers (${sellers.length})`,
              buyers: `Buyers (${users.filter(u => u.userType === 'BUYER').length})`,
              applications: `Apps (${applications.filter(a => a.status === 'PENDING').length})`,
              products: `Products (${products.length})`,
              orders: `Orders (${orders.length})`,
              'inventory-sources': '📦 Inventory',
              marketplace: '🌐 Marketplace',
              analytics: '📊 Analytics',
              apps: '📱 Apps'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-1.5 sm:pb-2 px-2 sm:px-3 text-[10px] sm:text-sm whitespace-nowrap min-h-9 sm:min-h-11 ${
                  activeTab === tab 
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {labels[tab] || tab}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">Users</h3>
              <div className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span className="font-bold">{stats?.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Buyers</span>
                  <span className="font-bold">{stats?.totalBuyers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sellers</span>
                  <span className="font-bold">{stats?.totalSellers || 0}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">Products</h3>
              <div className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Total Products</span>
                  <span className="font-bold">{stats?.totalProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Products</span>
                  <span className="font-bold">{stats?.activeProducts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Apps</span>
                  <span className="font-bold text-yellow-600">{applications.filter(a => a.status === 'PENDING').length}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-2">Orders</h3>
              <div className="space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Total Orders</span>
                  <span className="font-bold">{stats?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Orders</span>
                  <span className="font-bold text-yellow-600">{stats?.pendingOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Revenue</span>
                  <span className="font-bold text-green-600">${stats?.totalRevenue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab - Mobile friendly */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, index) => (
                    <tr key={emp.id}>
                      <td>{index + 1}</td>
                      <td className="text-xs sm:text-sm">{emp.email}</td>
                      <td className="text-xs sm:text-sm">{emp.firstName} {emp.lastName}</td>
                      <td><span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">ADMIN</span></td>
                      <td>
                        <button
                          onClick={() => updateUserRole(emp.id, 'BUYER')}
                          className="bg-yellow-600 text-white px-2 sm:px-3 py-1 rounded text-[10px] sm:text-sm hover:bg-yellow-700 min-h-8"
                        >
                          Remove Admin
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-8 text-gray-500">No employees found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sellers Tab - Mobile friendly */}
        {activeTab === 'sellers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Store</th>
                    <th>Owner</th>
                    <th>Email</th>
                    <th>Products</th>
                    <th>Sales</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller, index) => {
                    const email = seller.email || seller.user?.email || seller.userEmail || 'N/A';
                    const firstName = seller.firstName || seller.user?.firstName || '';
                    const lastName = seller.lastName || seller.user?.lastName || '';
                    const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : email;
                    
                    return (
                      <tr key={seller.id || seller.sellerId || index}>
                        <td>{index + 1}</td>
                        <td className="font-medium text-xs sm:text-sm">{seller.storeName || 'N/A'}</td>
                        <td className="text-xs sm:text-sm">{fullName}</td>
                        <td className="text-xs sm:text-sm">{email}</td>
                        <td className="text-center">{seller.totalProducts || seller.productCount || 0}</td>
                        <td className="text-center">{seller.totalSales || 0}</td>
                        <td>
                          <div className="flex flex-col gap-0.5">
                            <span className={`px-2 py-0.5 rounded text-[8px] sm:text-xs ${
                              seller.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {seller.isApproved ? '✅' : '⏳'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[8px] sm:text-xs ${
                              seller.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {seller.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-0.5">
                            {!seller.isApproved && (
                              <button onClick={() => approveSeller(seller.id || seller.sellerId)} className="bg-green-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-green-700 min-h-7">Approve</button>
                            )}
                            {seller.isActive ? (
                              <button onClick={() => disableSeller(seller.id || seller.sellerId)} className="bg-yellow-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-yellow-700 min-h-7">Disable</button>
                            ) : (
                              <button onClick={() => enableSeller(seller.id || seller.sellerId)} className="bg-blue-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-blue-700 min-h-7">Enable</button>
                            )}
                            <button onClick={() => removeSeller(seller.id || seller.sellerId)} className="bg-red-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-red-700 min-h-7">Remove</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sellers.length === 0 && (
                    <tr><td colSpan="8" className="text-center py-8 text-gray-500">No sellers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buyers Tab - Mobile friendly */}
        {activeTab === 'buyers' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Orders</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.userType === 'BUYER').map((buyer, index) => (
                    <tr key={buyer.id}>
                      <td>{index + 1}</td>
                      <td className="text-xs sm:text-sm">{buyer.email}</td>
                      <td className="text-xs sm:text-sm">{buyer.firstName} {buyer.lastName}</td>
                      <td className="text-center">{buyer.orders?.length || 0}</td>
                      <td className="text-xs sm:text-sm">{buyer.createdAt ? new Date(buyer.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button onClick={() => updateUserRole(buyer.id, 'SELLER')} className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-[10px] sm:text-sm hover:bg-blue-700 min-h-8">Make Seller</button>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => u.userType === 'BUYER').length === 0 && (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">No buyers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applications Tab - Mobile friendly */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Goods</th>
                    <th>Business</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => (
                    <tr key={app.id}>
                      <td>{index + 1}</td>
                      <td className="text-xs sm:text-sm">{app.email}</td>
                      <td className="text-xs sm:text-sm">{app.phoneNumber}</td>
                      <td className="text-xs sm:text-sm">{app.goodsToSell}</td>
                      <td className="text-xs sm:text-sm">{app.businessName || 'N/A'}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-[8px] sm:text-xs ${
                          app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td>
                        {app.status === 'PENDING' && (
                          <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-1">
                            <button onClick={() => approveApplication(app.id)} className="bg-green-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-green-700 min-h-7">Approve</button>
                            <button onClick={() => rejectApplication(app.id)} className="bg-red-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-red-700 min-h-7">Reject</button>
                          </div>
                        )}
                        {app.status !== 'PENDING' && <span className="text-xs text-gray-500">Reviewed</span>}
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">No applications found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab - Mobile friendly */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Seller</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td className="text-xs sm:text-sm">{product.name}</td>
                      <td className="text-xs sm:text-sm">${product.price}</td>
                      <td className="text-xs sm:text-sm">{product.seller?.storeName || 'N/A'}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-[8px] sm:text-xs ${
                          product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => deleteProduct(product.id)} className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-[10px] sm:text-sm hover:bg-red-700 min-h-8">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">No products found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab - Mobile friendly */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order #</th>
                    <th>Buyer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order.id}>
                      <td>{index + 1}</td>
                      <td className="text-xs sm:text-sm font-medium">{order.orderNumber || order.id}</td>
                      <td className="text-xs sm:text-sm">{order.buyerEmail || 'N/A'}</td>
                      <td className="text-xs sm:text-sm font-semibold">${order.totalAmount}</td>
                      <td>
                        <span className={`px-2 py-1 rounded text-[8px] sm:text-xs ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          order.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded text-[8px] sm:text-xs ${
                          order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="text-xs sm:text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-8 text-gray-500">No orders found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Sources Tab */}
        {activeTab === 'inventory-sources' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-gray-50">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">📦 Inventory Sources</h2>
                <Link to="/inventory-sources" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-xs sm:text-sm min-h-11 inline-flex items-center">Manage →</Link>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Connect to wholesale suppliers and inventory sources.</p>
            </div>
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm sm:text-base">Go to the Inventory Sources page to add and manage your suppliers.</p>
              <Link to="/inventory-sources" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-11">Open Inventory Sources</Link>
            </div>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-gray-50">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">🌐 Marketplace</h2>
                <Link to="/marketplace" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-xs sm:text-sm min-h-11 inline-flex items-center">Manage →</Link>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">List your products on Amazon, Walmart, eBay, TikTok, Google Shopping, and Etsy.</p>
            </div>
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm sm:text-base">Go to the Marketplace page to manage your product listings.</p>
              <Link to="/marketplace" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-11">Open Marketplace</Link>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-gray-50">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold">📊 Analytics</h2>
                <Link to="/analytics" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-xs sm:text-sm min-h-11 inline-flex items-center">View →</Link>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">View sales overview, revenue trends, and insights.</p>
            </div>
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm sm:text-base">Go to the Analytics page to see detailed reports.</p>
              <Link to="/analytics" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-11">Open Analytics</Link>
            </div>
          </div>
        )}

        {/* Apps Tab - Mobile friendly */}
        {activeTab === 'apps' && (
          <div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold mb-1">Applications</h2>
              <p className="text-xs sm:text-sm text-gray-500">Manage all your eCommerce applications</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <AppCard title="Teams" description="Manage team members, roles, and permissions" icon="👥" link="/teams" color="#3B82F6" />
              <AppCard title="PushAdvert" description="Push advertisements and manage services" icon="🛠️" link="/services" color="#10B981" />
              <AppCard title="Ticketing System" description="Manage customer support tickets" icon="🎫" link="/ticketing" color="#EF4444" comingSoon={true} />
            </div>

            {/* Quick Actions */}
            <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Link to="/inventory-sources" className="bg-green-50 text-green-700 p-3 rounded-lg text-center hover:bg-green-100 transition min-h-20 flex flex-col items-center justify-center">
                  <div className="text-xl sm:text-2xl">📦</div>
                  <div className="text-[10px] sm:text-sm font-medium">Add Inventory</div>
                </Link>
                <Link to="/marketplace" className="bg-purple-50 text-purple-700 p-3 rounded-lg text-center hover:bg-purple-100 transition min-h-20 flex flex-col items-center justify-center">
                  <div className="text-xl sm:text-2xl">🌐</div>
                  <div className="text-[10px] sm:text-sm font-medium">Marketplace</div>
                </Link>
                <Link to="/analytics" className="bg-cyan-50 text-cyan-700 p-3 rounded-lg text-center hover:bg-cyan-100 transition min-h-20 flex flex-col items-center justify-center">
                  <div className="text-xl sm:text-2xl">📊</div>
                  <div className="text-[10px] sm:text-sm font-medium">Analytics</div>
                </Link>
                <Link to="/services/add" className="bg-amber-50 text-amber-700 p-3 rounded-lg text-center hover:bg-amber-100 transition min-h-20 flex flex-col items-center justify-center">
                  <div className="text-xl sm:text-2xl">📝</div>
                  <div className="text-[10px] sm:text-sm font-medium">Push Ad</div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboardPage;