/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const updateRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
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
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="text-xs sm:text-sm">{user.id}</td>
                  <td className="text-xs sm:text-sm">{user.email}</td>
                  <td className="text-xs sm:text-sm">{user.firstName || ''} {user.lastName || ''}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[8px] sm:text-xs ${
                      user.userType === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.userType === 'SELLER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.userType}
                    </span>
                  </td>
                  <td>
                    {user.userType !== 'ADMIN' ? (
                      <select
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        className="border rounded px-1 sm:px-2 py-1 text-[10px] sm:text-sm min-h-9 sm:min-h-11"
                        defaultValue={user.userType}
                      >
                        <option value="BUYER">Buyer</option>
                        <option value="SELLER">Seller</option>
                      </select>
                    ) : (
                      <span className="text-[10px] sm:text-sm text-gray-500">(Admin)</span>
                    )}
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