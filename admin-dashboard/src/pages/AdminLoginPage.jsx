/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function AdminLoginPage({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting admin login with:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok || !data.token) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (data.userType !== 'ADMIN') {
        setError('Access denied. This panel is for admins only.');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify({
          email: data.email,
          userType: data.userType,
          firstName: data.firstName || '',
          lastName: data.lastName || ''
        }));
        console.log('Admin login successful');
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-blue-700">eStore</span>
            <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 text-xs sm:text-sm min-h-11 flex items-center">
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Top Banner */}
          <div className="bg-linear-to-r from-blue-600 to-purple-600 px-5 sm:px-8 py-5 sm:py-6 text-white">
            <h1 className="text-xl sm:text-2xl font-bold">Admin Login</h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">Sign in to manage your store</p>
          </div>

          <div className="p-5 sm:p-8">
            {/* Error Message */}
            {error && (
              <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 text-xs sm:text-sm flex items-start gap-2 ${
                error.includes('Access denied') 
                  ? 'bg-red-50 border border-red-200 text-red-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <span className="text-base sm:text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-xs sm:text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@estore.com"
                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base min-h-12"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-xs sm:text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">🔒</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base min-h-12"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-13"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In as Admin'
                )}
              </button>

              <div className="mt-6 text-center text-[10px] sm:text-xs text-gray-500">
                <p className="font-semibold text-red-500">⚠️ Only admins can access this panel</p>
                <p className="mt-1">
                  Need help? <a href="mailto:support@estore.com" className="text-blue-600 hover:underline">Contact Support</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-sm text-gray-500">
          <div>
            <span className="font-semibold text-blue-600">eStore</span> &copy; 2026 All rights reserved.
          </div>
          <div className="flex gap-4 sm:gap-6 mt-2 sm:mt-0">
            <a href="#" className="hover:text-blue-600 transition min-h-11 flex items-center">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition min-h-11 flex items-center">Terms</a>
            <a href="#" className="hover:text-blue-600 transition min-h-11 flex items-center">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminLoginPage;