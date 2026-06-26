/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Last updated: June 24, 2026</p>
        </div>

        {/* Breadcrumb */}
        <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-gray-700">Terms of Service</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">📋 Terms of Service</h2>
            <p className="text-sm sm:text-base text-gray-700">
              By using eStore, you agree to these terms. Please read them carefully before using our platform.
            </p>
          </div>

          {/* Section 1: Acceptance of Terms */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">✅</span> Acceptance of Terms
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              By accessing or using the eStore platform, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any part of these terms, 
              you may not use our services.
            </p>
          </div>

          {/* Section 2: Account Registration */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span> Account Registration
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">To create an account, you must:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Provide accurate and complete information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Be at least 18 years old</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Maintain the security of your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Notify us of any unauthorized use</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Buying and Selling */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛒</span> Buying and Selling
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm sm:text-base text-blue-700 mb-2">For Buyers</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Review product descriptions carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Check seller ratings and reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Understand return policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Pay securely through our platform</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm sm:text-base text-green-700 mb-2">For Sellers</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>List accurate product descriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Provide quality images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Ship orders promptly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">•</span>
                    <span>Provide excellent customer service</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Payments */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💳</span> Payments
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2 text-sm sm:text-base">
                  <span>💳 Payment Methods</span>
                  <span className="font-semibold">Credit Card, Debit Card, PayPal, Stripe</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2 text-sm sm:text-base">
                  <span>🔒 Security</span>
                  <span className="font-semibold">All payments are secure and encrypted</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2 text-sm sm:text-base">
                  <span>💰 Fees</span>
                  <span className="font-semibold">5% commission on successful sales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Shipping */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📦</span> Shipping
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">🚚</div>
                <h3 className="font-semibold text-sm sm:text-base">Shipping Times</h3>
                <p className="text-xs sm:text-sm text-gray-600">Sellers ship within 1-3 business days</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">🌍</div>
                <h3 className="font-semibold text-sm sm:text-base">International Shipping</h3>
                <p className="text-xs sm:text-sm text-gray-600">Available for most products</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">📋</div>
                <h3 className="font-semibold text-sm sm:text-base">Tracking</h3>
                <p className="text-xs sm:text-sm text-gray-600">Tracking provided for all orders</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">⚠️</div>
                <h3 className="font-semibold text-sm sm:text-base">Delivery Issues</h3>
                <p className="text-xs sm:text-sm text-gray-600">Contact us within 7 days if not received</p>
              </div>
            </div>
          </div>

          {/* Section 6: Returns and Refunds */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔄</span> Returns and Refunds
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span>📅 Return Window</span>
                  <span className="font-semibold">30 days from delivery</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span>💸 Refund Method</span>
                  <span className="font-semibold">Original payment method</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span>📄 Condition</span>
                  <span className="font-semibold">Items must be in original condition</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 7: Prohibited Items */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚫</span> Prohibited Items
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Illegal or counterfeit items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Hazardous materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Stolen goods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Discriminatory or offensive content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Items that violate copyright or trademarks</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 8: Intellectual Property */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">™️</span> Intellectual Property
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              All content on eStore, including text, graphics, logos, and images, is the property of 
              eStore and is protected by copyright laws. You may not reproduce, distribute, or create 
              derivative works without our express permission.
            </p>
          </div>

          {/* Section 9: User Conduct */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤝</span> User Conduct
            </h2>
            <ul className="space-y-2 text-sm sm:text-base text-gray-700">
              <li className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <span className="text-green-500">✓</span>
                <span>Be respectful to other users</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <span className="text-green-500">✓</span>
                <span>Provide accurate information</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <span className="text-green-500">✓</span>
                <span>Follow all laws and regulations</span>
              </li>
              <li className="flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <span className="text-green-500">✓</span>
                <span>Do not abuse the platform</span>
              </li>
            </ul>
          </div>

          {/* Section 10: Termination */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⛔</span> Termination
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              We reserve the right to terminate or suspend your account at any time for violations 
              of these terms, fraudulent activity, or any reason we deem necessary.
            </p>
          </div>

          {/* Section 11: Contact */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📞</span> Contact Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Link to="/help" className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition">
                <div className="text-3xl mb-2">❓</div>
                <h3 className="font-semibold text-sm sm:text-base">Help Center</h3>
                <p className="text-xs sm:text-sm text-gray-500">Visit our help center</p>
              </Link>
              <Link to="/contact" className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:bg-blue-100 transition">
                <div className="text-3xl mb-2">✉️</div>
                <h3 className="font-semibold text-sm sm:text-base">Contact Us</h3>
                <p className="text-xs sm:text-sm text-gray-500">We're here to help</p>
              </Link>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="border-t pt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              By continuing to use eStore, you agree to these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfServicePage;
