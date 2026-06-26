/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm sm:text-base">Loading users...</div>;
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Users Management</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className="text-gray-500 text-xs sm:text-sm">{index + 1}</td>
                  <td className="text-xs sm:text-sm">{user.email}</td>
                  <td className="text-xs sm:text-sm">{user.firstName} {user.lastName}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[8px] sm:text-xs ${
                      user.userType === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.userType === 'SELLER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.userType || 'BUYER'}
                    </span>
                  </td>
                  <td className="text-center text-xs sm:text-sm">{user.orders?.length || 0}</td>
                  <td>
                    <div className="flex flex-wrap gap-0.5">
                      {user.userType !== 'ADMIN' && (
                        <>
                          <button
                            onClick={() => updateUserRole(user.id, 'SELLER')}
                            className="bg-blue-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-blue-700 min-h-7"
                          >
                            Make Seller
                          </button>
                          <button
                            onClick={() => updateUserRole(user.id, 'ADMIN')}
                            className="bg-red-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-red-700 min-h-7"
                          >
                            Make Admin
                          </button>
                        </>
                      )}
                      {user.userType === 'ADMIN' && (
                        <button
                          onClick={() => updateUserRole(user.id, 'BUYER')}
                          className="bg-yellow-600 text-white px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-yellow-700 min-h-7"
                        >
                          Remove Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Users;