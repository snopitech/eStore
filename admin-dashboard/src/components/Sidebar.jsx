/* eslint-disable no-unused-vars */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👤', label: 'Users' },
    { path: '/sellers', icon: '🏪', label: 'Sellers' },
    { path: '/products', icon: '📦', label: 'Products' },
    { path: '/orders', icon: '📋', label: 'Orders' },
    { path: '/categories', icon: '📁', label: 'Categories' },
    { path: '/marketplace', icon: '🌐', label: 'Marketplace' },
    { path: '/inventory-sources', icon: '📦', label: 'Inventory' },
    { path: '/analytics', icon: '📊', label: 'Analytics' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-64 lg:w-56 xl:w-64 
          bg-gray-800 min-h-screen 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-white text-xl lg:text-2xl font-bold">Admin</span>
          <button 
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-2 min-h-11 min-w-11"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition min-h-11 ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-lg sm:text-xl shrink-0">{item.icon}</span>
              <span className="text-sm sm:text-base truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-gray-400 text-xs text-center">
            <span className="font-semibold text-blue-400">eStore</span> Admin
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;