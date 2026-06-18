/* eslint-disable no-unused-vars */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/users', icon: '👤', label: 'Users' },
    { path: '/sellers', icon: '🏪', label: 'Sellers' },
    { path: '/products', icon: '📦', label: 'Products' },
    { path: '/orders', icon: '📋', label: 'Orders' },
    { path: '/categories', icon: '📁', label: 'Categories' },
  ];

  return (
    <aside className="w-64 bg-gray-800 min-h-screen p-4">
      <div className="text-white text-2xl font-bold mb-8 px-2">Admin</div>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;