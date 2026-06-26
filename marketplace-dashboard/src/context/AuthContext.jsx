/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:8087/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        console.log('User loaded from localStorage:', JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, [token]);

  // Regular login with email/password
  const login = async (email, password) => {
    try {
      console.log('=== LOGIN ATTEMPT ===');
      console.log('Email:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      console.log('Login response:', data);
      
      if (data.token) {
        // Store user with firstName and lastName
        const userData = {
          email: data.email,
          userType: data.userType,
          firstName: data.firstName || '',
          lastName: data.lastName || ''
        };
        
        console.log('Storing user data:', userData);
        
        setToken(data.token);
        setUser(userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Google login (called from Google button)
  const googleLogin = async (token, userData) => {
    console.log('=== GOOGLE LOGIN CALLED ===');
    console.log('Token:', token);
    console.log('User Data:', userData);
    
    // Store user with firstName and lastName
    const userInfo = {
      email: userData.email || '',
      userType: userData.userType || 'BUYER',
      firstName: userData.firstName || '',
      lastName: userData.lastName || ''
    };
    
    console.log('Storing Google user:', userInfo);
    
    setToken(token);
    setUser(userInfo);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userInfo));
    return { success: true };
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      
      if (data.userId) {
        return await login(userData.email, userData.password);
      }
      return { success: false, error: data.message || 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out');
  };

  const value = {
    user,
    token,
    login,
    googleLogin,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}