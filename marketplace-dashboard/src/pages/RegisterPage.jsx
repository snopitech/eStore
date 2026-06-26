/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const API_BASE_URL = 'http://estore.snopitech.com/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    userType: 'BUYER',
    businessName: '',
    businessAddress: '',
    goodsToSell: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Regular registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          userType: formData.userType
        })
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        setError(registerData.message || 'Registration failed');
        setLoading(false);
        return;
      }

      if (formData.userType === 'SELLER') {
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          setError('Account created but login failed. Please login manually.');
          setLoading(false);
          navigate('/login');
          return;
        }

        const applicationResponse = await fetch(`${API_BASE_URL}/seller/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify({
            phoneNumber: formData.phoneNumber,
            address: formData.address || formData.businessAddress,
            goodsToSell: formData.goodsToSell,
            businessName: formData.businessName,
            businessAddress: formData.businessAddress
          })
        });

        if (applicationResponse.ok) {
          setMessage('✅ Registration successful! Your seller application has been submitted for admin approval.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          const appData = await applicationResponse.json();
          setError('Account created but application failed: ' + (appData.message || 'Please apply later'));
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else {
        setMessage('✅ Registration successful! Please login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google Signup Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google signup success:', credentialResponse);
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: credentialResponse.credential,
          userType: formData.userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Google signup successful! Please login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Google signup failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google signup failed');
    setError('Google signup failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId="980732875531-ndhd7trran0r02llctngmmggmeifl6el.apps.googleusercontent.com">
      <div className="min-h-screen flex items-center justify-center bg-gray-100 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-5 sm:p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">eStore</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Create your account</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 text-sm">
              {message}
            </div>
          )}

          {/* Google Signup Button */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className="w-full max-w-[350px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signup_with"
                shape="rectangular"
                logo_alignment="center"
                width={350}
              />
            </div>
          </div>

          <div className="flex items-center my-3 sm:my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 sm:px-4 text-gray-500 text-xs sm:text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="mb-2 sm:mb-3">
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                  required
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                  required
                />
              </div>
            </div>

            <div className="mb-2 sm:mb-3">
              <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required
              />
            </div>

            <div className="mb-2 sm:mb-3">
              <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required
                minLength="6"
              />
            </div>

            <div className="mb-2 sm:mb-3">
              <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="mb-3 sm:mb-4">
              <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                I want to
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
              >
                <option value="BUYER">Shop as a Buyer</option>
                <option value="SELLER">Apply as a Seller</option>
              </select>
            </div>

            {/* Seller Fields */}
            {formData.userType === 'SELLER' && (
              <div className="border-t pt-3 sm:pt-4 mt-2 space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-gray-700 text-xs sm:text-sm">Seller Application</h3>

                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                    required={formData.userType === 'SELLER'}
                    placeholder="Enter your address"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                    required={formData.userType === 'SELLER'}
                    placeholder="Enter your business/store name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
                    required={formData.userType === 'SELLER'}
                    placeholder="Enter your business address"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-bold mb-1">
                    What goods do you want to sell? *
                  </label>
                  <textarea
                    name="goodsToSell"
                    value={formData.goodsToSell}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[80px]"
                    required={formData.userType === 'SELLER'}
                    placeholder="Describe the products you want to sell..."
                  />
                </div>

                <p className="text-xs text-gray-500 italic">
                  Your application will be submitted for admin approval.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 mt-3 sm:mt-4 text-sm sm:text-base min-h-[48px] font-medium"
            >
              {loading ? 'Creating account...' : formData.userType === 'SELLER' ? 'Register & Submit Application' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default RegisterPage;
