/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function CartPage() {
  const { cartItems, updateQuantity, removeItem, clearCart, cartCount } = useCart();
  const { user } = useAuth();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">You need to be logged in to view your cart.</p>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 min-h-[44px] inline-flex items-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 min-h-[44px] inline-flex items-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shopping Cart ({cartCount} items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Mobile Card View */}
              <div className="block md:hidden">
                {cartItems.map((item) => (
                  <div key={item.id} className="border-b p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-sm">{item.productName}</div>
                        <div className="text-xs text-gray-500">{item.storeName}</div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm min-h-[44px] min-w-[44px]"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">${item.priceAtAdd} each</div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="border rounded px-2 py-1 text-sm min-h-[44px]"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                        <div className="font-semibold text-sm">${(item.priceAtAdd * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm">Product</th>
                      <th className="text-left py-3 px-4 text-sm">Price</th>
                      <th className="text-left py-3 px-4 text-sm">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm">Total</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-sm">{item.productName}</div>
                            <div className="text-xs text-gray-500">{item.storeName}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm">${item.priceAtAdd}</td>
                        <td className="py-4 px-4">
                          <select
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                            className="border rounded px-2 py-1 text-sm min-h-[44px]"
                          >
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-4 font-semibold text-sm">${(item.priceAtAdd * item.quantity).toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm min-h-[44px] min-w-[44px]"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-between gap-2">
              <Link to="/" className="text-blue-600 hover:underline text-sm sm:text-base min-h-[44px] flex items-center">
                ← Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-red-600 hover:underline text-sm sm:text-base min-h-[44px]"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary - Mobile Friendly */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-20">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Order Summary</h2>
              <div className="space-y-2 mb-3 sm:mb-4 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-base sm:text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Link 
                to="/checkout" 
                className="w-full bg-yellow-500 text-gray-900 py-3 rounded-md font-semibold hover:bg-yellow-400 text-center block text-sm sm:text-base min-h-[48px] flex items-center justify-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;