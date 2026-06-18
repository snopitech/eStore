/* eslint-disable no-useless-assignment */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8087/api';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.categoryId === parseInt(selectedCategory));

  const handleAddToCart = async (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    const success = await addToCart(productId, 1);
    if (success) {
      alert('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading eStore marketplace...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100">
      {/* Category Navigation */}
      <nav className="bg-gray-800 text-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex space-x-6 overflow-x-auto py-3 text-sm">
            <li 
              className={`cursor-pointer hover:text-blue-300 whitespace-nowrap ${selectedCategory === 'all' ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </li>
            {categories.filter(c => !c.parent).map(category => (
              <li 
                key={category.id}
                className={`cursor-pointer hover:text-blue-300 whitespace-nowrap ${selectedCategory === category.id ? 'text-blue-300 border-b-2 border-blue-300' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Secure Purchase</h1>
              <p className="text-lg mb-4">Sell your vehicles for free</p>
              <p className="text-sm mb-6">Pay zero listing fees and reach verified buyers nationwide.</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">List now</button>
              <p className="text-xs mt-2">Ends 7/15. Terms apply.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-6 text-center">
              <p className="text-xl mb-2">Obsessed with pre-loved fashion</p>
              <p className="text-sm">Elevate your outfit game with top brands from partner sellers.</p>
              <button className="mt-4 bg-white text-blue-700 px-6 py-2 rounded hover:bg-gray-100">Shop pre-loved</button>
            </div>
          </div>
        </div>
      </div>

      {/* eStore Live Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">eStore Live</h2>
          <a href="#" className="text-blue-600 hover:underline">Tune in and shop curated experiences</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-300 h-32 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-red-600 font-bold">LIVE</span>
                  <span className="ml-1 text-sm">- 83</span>
                </div>
              </div>
              <div className="p-2 text-center">
                <p className="text-xs font-medium">GREAT</p>
                <p className="text-xs text-gray-500">Great</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recommended for you</h2>
          <a href="#" className="text-blue-600 hover:underline text-sm">SEE ALL</a>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.slice(0, 10).map((product) => {
              // Parse images to get first image
              let productImage = null;
              try {
                const images = product.images ? JSON.parse(product.images) : [];
                productImage = images[0];
              } catch (e) {
                productImage = null;
              }
              
              return (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id} 
                  className="block bg-white rounded-lg shadow hover:shadow-lg transition group"
                >
                  <div className="h-40 bg-gray-100 rounded-t-lg flex items-center justify-center p-3">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{product.storeName}</p>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    <div className="text-lg font-bold text-gray-900 mt-1">${product.price}</div>
                    <button 
                      onClick={(e) => handleAddToCart(product.id, e)}
                      className="w-full mt-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;