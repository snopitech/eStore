/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const data = await api.getSellers();
      setSellers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setLoading(false);
    }
  };

  const approveSeller = async (sellerId) => {
    try {
      await api.approveSeller(sellerId);
      fetchSellers();
    } catch (error) {
      console.error('Error approving seller:', error);
    }
  };

  const blockSeller = async (sellerId) => {
    try {
      await api.blockSeller(sellerId);
      fetchSellers();
    } catch (error) {
      console.error('Error blocking seller:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading sellers...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sellers Management</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Store Name</th>
                <th className="text-left py-3 px-4">Owner</th>
                <th className="text-left py-3 px-4">Products</th>
                <th className="text-left py-3 px-4">Sales</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{seller.id}</td>
                  <td className="py-3 px-4 font-medium">{seller.storeName}</td>
                  <td className="py-3 px-4">{seller.user?.email || 'N/A'}</td>
                  <td className="py-3 px-4">{seller.totalProducts || 0}</td>
                  <td className="py-3 px-4">{seller.totalSales || 0}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      seller.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {seller.isApproved ? 'Approved' : 'Pending'}
                    </span>
                    {!seller.isActive && (
                      <span className="ml-1 px-2 py-1 rounded text-xs bg-red-100 text-red-800">Blocked</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {!seller.isApproved && (
                        <button
                          onClick={() => approveSeller(seller.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                      )}
                      {seller.isActive ? (
                        <button
                          onClick={() => blockSeller(seller.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => approveSeller(seller.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Unblock
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

export default Sellers;