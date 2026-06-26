/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Last updated: June 24, 2026</p>
        </div>

        {/* Breadcrumb */}
        <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-gray-700">Privacy Policy</span>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Summary Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">🔒 Privacy Policy</h2>
            <p className="text-sm sm:text-base text-gray-700">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">📋</span> Information We Collect
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">👤</div>
                <h3 className="font-semibold text-sm sm:text-base">Personal Information</h3>
                <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Name and contact details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Email address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Phone number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Shipping address</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl mb-1">💻</div>
                <h3 className="font-semibold text-sm sm:text-base">Usage Information</h3>
                <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Browsing history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Purchase history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Device information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>IP address</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: How We Use Your Information */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl mb-1">🛒</div>
                <h3 className="font-semibold text-sm sm:text-base">Order Processing</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Process and fulfill your orders</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl mb-1">📧</div>
                <h3 className="font-semibold text-sm sm:text-base">Communication</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Send order updates and promotions</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl mb-1">🔒</div>
                <h3 className="font-semibold text-sm sm:text-base">Security</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Protect against fraud and abuse</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl mb-1">📊</div>
                <h3 className="font-semibold text-sm sm:text-base">Improvement</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Improve our services and platform</p>
              </div>
            </div>
          </div>

          {/* Section 3: Information Sharing */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤝</span> Information Sharing
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2 text-sm sm:text-base">
                  <span>🛒 With Sellers</span>
                  <span className="font-semibold">Order details for fulfillment</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2 text-sm sm:text-base">
                  <span>📦 With Shipping Partners</span>
                  <span className="font-semibold">Address for delivery</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center flex-wrap gap-2 text-sm sm:text-base">
                  <span>💳 With Payment Processors</span>
                  <span className="font-semibold">Payment details (encrypted)</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ We <strong>never</strong> sell your personal information to third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Cookies */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🍪</span> Cookies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">🔑</div>
                <h3 className="font-semibold text-sm sm:text-base">Essential</h3>
                <p className="text-xs sm:text-sm text-gray-500">Required for site functionality</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">📊</div>
                <h3 className="font-semibold text-sm sm:text-base">Analytics</h3>
                <p className="text-xs sm:text-sm text-gray-500">Understand user behavior</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <h3 className="font-semibold text-sm sm:text-base">Preferences</h3>
                <p className="text-xs sm:text-sm text-gray-500">Remember your settings</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-3 text-center">
              You can control cookie preferences in your browser settings.
            </p>
          </div>

          {/* Section 5: Data Security */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛡️</span> Data Security
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-gray-700">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <h3 className="font-semibold">Encryption</h3>
                    <p className="text-xs sm:text-sm text-gray-600">All data is encrypted using SSL/TLS</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👨‍💻</span>
                  <div>
                    <h3 className="font-semibold">Access Control</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Limited access to authorized personnel</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-semibold">Regular Audits</h3>
                    <p className="text-xs sm:text-sm text-gray-600">We regularly review our security practices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Your Rights */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👤</span> Your Rights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm sm:text-base">🔍 Access</h3>
                <p className="text-xs sm:text-sm text-gray-600">Request a copy of your data</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm sm:text-base">✏️ Correction</h3>
                <p className="text-xs sm:text-sm text-gray-600">Update inaccurate information</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm sm:text-base">🗑️ Deletion</h3>
                <p className="text-xs sm:text-sm text-gray-600">Request deletion of your data</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm sm:text-base">🚫 Opt-Out</h3>
                <p className="text-xs sm:text-sm text-gray-600">Unsubscribe from marketing emails</p>
              </div>
            </div>
          </div>

          {/* Section 7: Children's Privacy */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🧒</span> Children's Privacy
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm sm:text-base text-gray-700">
                eStore is not intended for children under 13. We do not knowingly collect personal 
                information from children under 13. If you believe we have, please contact us.
              </p>
            </div>
          </div>

          {/* Section 8: Changes to This Policy */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Changes to This Policy
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </div>

          {/* Section 9: Contact Us */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📞</span> Contact Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Email</h3>
                    <p className="text-xs sm:text-sm text-blue-600">support@snopitech.com</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">Phone</h3>
                    <p className="text-xs sm:text-sm text-blue-600">+1 (713) 870-1132</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                📍 1023 Christmas Ln, Baltimore, MD 21054.
              </p>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="border-t pt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              By using eStore, you agree to our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;