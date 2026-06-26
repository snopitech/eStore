/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-400">About eStore</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
              <li><Link to="/press" className="hover:text-white transition">Press</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-400">Sell</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/seller/apply" className="hover:text-white transition">Become a Seller</Link></li>
              <li><Link to="/seller/dashboard" className="hover:text-white transition">Seller Dashboard</Link></li>
              <li><Link to="/commissions" className="hover:text-white transition">Commissions</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-400">Support</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/returns" className="hover:text-white transition">Return Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition">Shipping Info</Link></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-gray-400">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="hover:text-blue-400 transition text-2xl">📱</a>
              <a href="#" className="hover:text-blue-400 transition text-2xl">🐦</a>
              <a href="#" className="hover:text-blue-400 transition text-2xl">📷</a>
              <a href="#" className="hover:text-blue-400 transition text-2xl">💼</a>
            </div>
            <div className="mt-3 text-sm text-gray-400">
              <p>📧 support@snopitech.com</p>
              <p className="text-xs mt-1">Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 eStore. All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/privacy" className="hover:text-white transition font-medium text-blue-400">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
              <Link to="/returns" className="hover:text-white transition">Return Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
