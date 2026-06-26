/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminResetPasswordPage from './pages/AdminResetPasswordPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import Users from './pages/Users';
import Sellers from './pages/Sellers';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import AdminMarketplacePage from './pages/AdminMarketplacePage';
import AdminInventorySourcesPage from './pages/AdminInventorySourcesPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    console.log('App loaded - token:', token);
    console.log('App loaded - userData:', userData);
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* ADMIN LOGIN */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <AdminLoginPage setIsAuthenticated={setIsAuthenticated} />
        } />
        
        {/* Admin Reset Password - PUBLIC */}
        <Route path="/admin-reset-password" element={<AdminResetPasswordPage />} />
        
        {/* PROTECTED ROUTES - Login required */}
        <Route path="/" element={
          isAuthenticated ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<Users />} />
          <Route path="sellers" element={<Sellers />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="marketplace" element={<AdminMarketplacePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="inventory-sources" element={<AdminInventorySourcesPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;