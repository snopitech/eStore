/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.getOrders(token);
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(token, orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm sm:text-base">Loading orders...</div>;
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800'
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Orders Management</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Buyer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium text-xs sm:text-sm">{order.orderNumber}</td>
                  <td>
                    <div className="text-[10px] sm:text-sm">
                      <div className="font-medium">{order.buyerName || 'N/A'}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">{order.buyerEmail || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="font-semibold text-xs sm:text-sm">${order.totalAmount}</td>
                  <td>
                    <span className={`px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-xs ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {order.status || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-xs ${
                      order.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.paymentStatus || 'PENDING'}
                    </span>
                  </td>
                  <td>
                    <select
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="border rounded px-1 sm:px-2 py-1 text-[10px] sm:text-sm min-h-9 sm:min-h-11"
                      defaultValue={order.status || 'PENDING'}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
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

export default Orders;