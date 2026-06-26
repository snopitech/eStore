/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';

function SecurePurchasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-purple-700 text-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-yellow-400 text-blue-900 text-xs font-bold px-4 py-1.5 rounded-full mb-4 animate-pulse">
                🔥 LIMITED TIME OFFER
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
                Secure Purchase
              </h1>
              <p className="text-xl sm:text-2xl font-semibold mb-2">Sell your vehicles for free</p>
              <p className="text-blue-100 text-base sm:text-lg mb-6 max-w-lg">
                Pay zero listing fees and reach verified buyers nationwide.
              </p>
              <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4 mb-8">
                <p className="text-yellow-300 font-bold text-lg">⏰ Ends 7/15</p>
                <p className="text-blue-100 text-sm">Terms and conditions apply. Don't miss out!</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="bg-yellow-400 text-blue-900 px-8 sm:px-10 py-3.5 rounded-xl font-bold hover:bg-yellow-300 transition text-base sm:text-lg min-h-[56px] shadow-xl hover:shadow-2xl">
                  🚀 List Now
                </button>
                <Link to="/how-it-works" className="border-2 border-white/40 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-white/10 transition text-base sm:text-lg min-h-[56px] flex items-center">
                  How It Works →
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-2xl font-bold">$0</div>
                <div className="text-sm text-blue-200">Listing Fees</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-2xl font-bold">10k+</div>
                <div className="text-sm text-blue-200">Verified Buyers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="text-4xl mb-2">⚡</div>
                <div className="text-2xl font-bold">24h</div>
                <div className="text-sm text-blue-200">Avg. Sale Time</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="text-4xl mb-2">🔒</div>
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm text-blue-200">Secure Payment</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Why Sell with eStore?
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Join thousands of sellers who trust eStore to sell their vehicles quickly and securely.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">🆓</div>
            <h3 className="font-semibold text-lg mb-2">Zero Listing Fees</h3>
            <p className="text-gray-500 text-sm">List your vehicle completely free. No hidden charges.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="font-semibold text-lg mb-2">Verified Buyers</h3>
            <p className="text-gray-500 text-sm">Reach thousands of verified buyers across the country.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-semibold text-lg mb-2">Secure Payments</h3>
            <p className="text-gray-500 text-sm">All transactions are secure and protected.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-semibold text-lg mb-2">Mobile Friendly</h3>
            <p className="text-gray-500 text-sm">List and sell from anywhere, anytime.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to List Your Vehicle?
          </h2>
          <p className="text-blue-100 text-base sm:text-lg mb-6 max-w-2xl mx-auto">
            Start selling today. No listing fees. No hidden costs. Just results.
          </p>
          <button className="bg-yellow-400 text-blue-900 px-10 py-4 rounded-xl font-bold hover:bg-yellow-300 transition text-lg min-h-[56px] shadow-xl">
            🚀 List Now for Free
          </button>
          <p className="text-blue-200 text-sm mt-4">Ends 7/15. Terms apply.</p>
        </div>
      </div>
    </div>
  );
}

export default SecurePurchasePage;