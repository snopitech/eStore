/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';

function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Return Policy</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Last updated: June 24, 2026</p>
        </div>

        {/* Breadcrumb */}
        <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-gray-700">Return Policy</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">📦 Easy Returns</h2>
            <p className="text-sm sm:text-base text-gray-700">
              We want you to be completely satisfied with your purchase. If you're not happy with your order, 
              you can return most items within <strong>30 days</strong> of delivery.
            </p>
          </div>

          {/* Section 1: Returns Overview */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">📋</span> Return Policy Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">🗓️</div>
                <h3 className="font-semibold text-sm sm:text-base">30-Day Returns</h3>
                <p className="text-xs sm:text-sm text-gray-500">Return eligible items within 30 days of delivery.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">📄</div>
                <h3 className="font-semibold text-sm sm:text-base">Free Returns</h3>
                <p className="text-xs sm:text-sm text-gray-500">Free return shipping on eligible items.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">💸</div>
                <h3 className="font-semibold text-sm sm:text-base">Full Refund</h3>
                <p className="text-xs sm:text-sm text-gray-500">Receive a full refund to your original payment method.</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">🔄</div>
                <h3 className="font-semibold text-sm sm:text-base">Easy Process</h3>
                <p className="text-xs sm:text-sm text-gray-500">Simple return process with no hassle.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Return Process */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> How to Return an Item
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Request a Return</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Go to your order history and select the item you want to return.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Print Return Label</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Print the prepaid return shipping label we'll provide.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Pack and Ship</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Pack the item securely and drop it off at the nearest shipping location.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Get Refund</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Once we receive and inspect the item, we'll issue your refund.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Return Conditions */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span> Return Conditions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-green-600 mb-2">Eligible Items</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Items returned within 30 days of delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Items in original condition with tags</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Items in original packaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Electronics with all accessories</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-red-600 mb-2">Non-Eligible Items</h3>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>Items returned after 30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>Items with signs of wear or damage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>Final sale or clearance items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500">✗</span>
                    <span>Digital products once downloaded</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Refund Process */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💰</span> Refund Process
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span>⏱️ Processing Time</span>
                  <span className="font-semibold">3-5 business days</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span>💳 Refund Method</span>
                  <span className="font-semibold">Original payment method</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span>📧 Notification</span>
                  <span className="font-semibold">Email confirmation sent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Seller Returns Policy */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛒</span> Seller Return Policies
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Individual sellers may have specific return policies. Always check the seller's return policy 
              before making a purchase.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Review the seller's return policy on the product page before purchasing.
              </p>
            </div>
          </div>

          {/* Section 6: Contact Support */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📞</span> Need Help?
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
        </div>
      </div>
    </div>
  );
}

export default ReturnPolicyPage;