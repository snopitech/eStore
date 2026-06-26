/* eslint-disable no-unused-vars */
const API_BASE_URL = 'http://localhost:8087/api';

const getToken = () => localStorage.getItem('adminToken');

// Helper to handle responses that might be plain text or JSON
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  // If response is plain text
  const text = await response.text();
  if (!text) {
    return { success: response.ok };
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    // If it's plain text like "Category deleted"
    return { success: response.ok, message: text };
  }
};

export const api = {
  // Auth
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  // Admin - Dashboard
  getStats: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Admin - Users
  getUsers: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  updateUserRole: async (userId, role) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    });
    return response.json();
  },

  deleteUser: async (userId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  // Admin - Sellers
  getSellers: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/sellers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getSellerById: async (sellerId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  approveSeller: async (sellerId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  blockSeller: async (sellerId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/block`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  disableSeller: async (sellerId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/disable`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  enableSeller: async (sellerId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/enable`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  removeSeller: async (sellerId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/sellers/${sellerId}/remove`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  // Admin - Seller Applications
  getApplications: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  approveApplication: async (applicationId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  rejectApplication: async (applicationId, reason) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/applications/${applicationId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });
    return handleResponse(response);
  },

  // Admin - Products
  getProducts: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  deleteProduct: async (productId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  },

  // Admin - Orders
  getOrders: async () => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  updateOrderStatus: async (orderId, status) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  // Admin - Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },

  createCategory: async (category) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(category)
    });
    return response.json();
  },

  updateCategory: async (categoryId, category) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(category)
    });
    return response.json();
  },

  deleteCategory: async (categoryId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  }
};