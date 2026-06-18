const API_BASE_URL = 'https://api.estore.snopitech.com/api';

export const api = {
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    return response.json();
  },
  
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    return response.json();
  },
  
  getProductById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return response.json();
  },
  
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },
  
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
};