/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    onLogout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">
        Admin Dashboard
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {user?.email || 'Admin'}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;