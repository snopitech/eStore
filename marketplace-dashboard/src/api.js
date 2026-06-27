// Detect if we're in development or production
const isDevelopment = import.meta.env.DEV || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

// Use environment variable or fallback
const API_BASE_URL = isDevelopment 
    ? 'http://localhost:8087' 
    : 'https://estore.snopitech.com';

// Create a reusable fetch function
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
};

// Specific API calls
export const api = {
    // Categories
    getCategories: () => apiFetch('/api/categories'),
    getCategory: (id) => apiFetch(`/api/categories/${id}`),
    
    // Products
    getProducts: () => apiFetch('/api/products'),
    getProduct: (id) => apiFetch(`/api/products/${id}`),
    
    // Cart
    getCart: () => apiFetch('/api/cart'),
    addToCart: (data) => apiFetch('/api/cart', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    }),
    updateCartItem: (id, data) => apiFetch(`/api/cart/${id}`, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
    }),
    removeFromCart: (id) => apiFetch(`/api/cart/${id}`, { 
        method: 'DELETE' 
    }),
    
    // Orders
    getOrders: () => apiFetch('/api/orders'),
    getOrder: (id) => apiFetch(`/api/orders/${id}`),
    createOrder: (data) => apiFetch('/api/orders', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    }),
    
    // User
    getUser: () => apiFetch('/api/user'),
    updateUser: (data) => apiFetch('/api/user', { 
        method: 'PUT', 
        body: JSON.stringify(data) 
    }),
    
    // Auth
    login: (data) => apiFetch('/api/auth/login', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    }),
    register: (data) => apiFetch('/api/auth/register', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    }),
    logout: () => apiFetch('/api/auth/logout', { 
        method: 'POST' 
    }),
    
    // Reviews
    getReviews: (productId) => apiFetch(`/api/products/${productId}/reviews`),
    createReview: (data) => apiFetch('/api/reviews', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    }),
    
    // Wishlist
    getWishlist: () => apiFetch('/api/wishlist'),
    addToWishlist: (productId) => apiFetch(`/api/wishlist/${productId}`, { 
        method: 'POST' 
    }),
    removeFromWishlist: (productId) => apiFetch(`/api/wishlist/${productId}`, { 
        method: 'DELETE' 
    }),
};

export default api;