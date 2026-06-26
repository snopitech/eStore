/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

function Layout({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Users', path: '/users', icon: '👤' },
    { name: 'Sellers', path: '/sellers', icon: '🛍️' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Orders', path: '/orders', icon: '📋' },
    { name: 'Categories', path: '/categories', icon: '📁' },
    { name: 'Marketplace', path: '/marketplace', icon: '🌐' },
    { name: 'Inventory', path: '/inventory-sources', icon: '📦' },
    { name: 'Analytics', path: '/analytics', icon: '📈' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="bg-blue-700 text-white sticky top-0 z-40 sm:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-blue-600 min-h-11 min-w-11"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xl font-bold">eStore Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm hidden xs:inline">{user?.email?.split('@')[0]}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-blue-600 min-h-11 min-w-11"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden sm:flex bg-blue-700 text-white items-center justify-between px-6 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-2xl font-bold">eStore Admin</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">👋 {user?.email}</span>
          <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-800 px-4 py-2 rounded text-sm transition min-h-11">
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:block w-56 bg-white shadow-lg min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition min-h-11 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 sm:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-blue-700">eStore Admin</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 min-h-11 min-w-11"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              👋 {user?.email}
            </div>
          </div>
          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-120px)]">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition min-h-12 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition min-h-12"
            >
              <span className="text-lg">🚪</span>
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 pb-24 sm:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;