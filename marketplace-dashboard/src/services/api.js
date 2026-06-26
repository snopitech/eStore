const API_BASE_URL = 'https://pesky-dividers-blend.ngrok-free.dev/api';
export const api = {
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    return response.json();
  },
  
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
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
  },
  
  getCart: async (token) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  addToCart: async (token, productId, quantity) => {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    return response.json();
  },
  
  checkout: async (token, orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    return response.json();
  },
  
  getMyOrders: async (token) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  createPaymentIntent: async (token, orderId) => {
    const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId })
    });
    return response.json();
  },
  
  getWishlist: async (token) => {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  addToWishlist: async (token, productId) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/add/${productId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },
  
  removeFromWishlist: async (token, productId) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/remove/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  checkWishlist: async (token, productId) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  getProductReviews: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
    return response.json();
  },
  
  createReview: async (token, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    return response.json();
  }
};
