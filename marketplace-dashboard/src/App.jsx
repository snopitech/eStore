/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import MobileAppWrapper from './components/MobileAppWrapper';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import SellerApplicationPage from './pages/SellerApplicationPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import CategoryPage from './pages/CategoryPage';
import ProductsPage from './pages/ProductsPage';
import LivePage from './pages/LivePage';
import CommissionSummaryPage from './pages/CommissionSummaryPage';
import SellerStorefrontPage from './pages/SellerStorefrontPage';
import StripeConnectAccountPage from './pages/StripeConnectAccountPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import SecurePurchasePage from './pages/SecurePurchasePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <MobileAppWrapper>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow pb-20 sm:pb-0">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/product/:id" element={<ProductDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
                  <Route path="/order-history" element={<OrderHistoryPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/seller/apply" element={<SellerApplicationPage />} />
                  <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                  <Route path="/seller/connect" element={<StripeConnectAccountPage />} />
                  <Route path="/categories/:categoryId" element={<CategoryPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/seller/:sellerId" element={<SellerStorefrontPage />} />
                  <Route path="/commissions" element={<CommissionSummaryPage />} />
                  <Route path="/live" element={<LivePage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/advanced-search" element={<AdvancedSearchPage />} />
                  <Route path="/secure-purchase" element={<SecurePurchasePage />} />
                  <Route path="/returns" element={<ReturnPolicyPage />} />
                </Routes>
              </main>
              <Footer />
              <BottomNav />
            </div>
          </MobileAppWrapper>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
