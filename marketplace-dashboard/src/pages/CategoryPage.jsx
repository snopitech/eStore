/* eslint-disable react-hooks/immutability */
/* eslint-disable no-useless-assignment */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8087/api';

function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    if (categoryId) {
      fetchCategoryProducts(categoryId);
    }
  }, [categoryId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategoryProducts = async (id) => {
    setLoading(true);
    try {
      const categoryRes = await fetch(`${API_BASE_URL}/categories/${id}`);
      if (categoryRes.ok) {
        const catData = await categoryRes.json();
        setCategory(catData);
      }

      const productsRes = await fetch(`${API_BASE_URL}/products/category/${id}`);
      const data = await productsRes.json();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching category products:', error);
      setProducts([]);
      setLoading(false);
    }
  };

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

  const isInStock = (product) => {
    return product.quantity !== undefined && product.quantity > 0;
  };

  const getPlaceholderSvg = (size = 200) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3E%3Crect x='2' y='2' width='20' height='20' rx='2' fill='%23f3f4f6'/%3E%3Cpath d='M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' fill='%23999'/%3E%3Cpath d='M21 15l-5-4-3 3-5-4-6 6' stroke='%23999' fill='none'/%3E%3C/svg%3E`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-8">
        {/* Category Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <span>›</span>
            <span className="text-gray-700 font-semibold">{category?.name || 'Category'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{category?.name || 'Products'}</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{products.length} products found</p>
        </div>

        {/* Category Navigation - Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-3 sm:pb-4 mb-4 sm:mb-6 hide-scrollbar">
          <Link
            to="/products"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full text-xs sm:text-sm hover:bg-gray-200 whitespace-nowrap min-h-[36px] sm:min-h-[44px] flex items-center"
          >
            All Products
          </Link>
          {categories.filter(c => c.isActive !== false).map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.id}`}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap min-h-[36px] sm:min-h-[44px] flex items-center ${
                parseInt(categoryId) === cat.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Products Grid - Wider */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <div className="text-4xl sm:text-6xl mb-4">📦</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No products in this category</h3>
            <p className="text-sm sm:text-base text-gray-500">Check back later for new products.</p>
            <Link to="/products" className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-[44px] items-center justify-center">
              View All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {products.map((product) => {
              let productImage = null;
              try {
                const images = product.images ? JSON.parse(product.images) : [];
                productImage = images[0];
              } catch (e) {
                productImage = null;
              }
              
              const inStock = isInStock(product);
              
              return (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id} 
                  className="block bg-white rounded-lg shadow hover:shadow-lg transition group relative"
                >
                  {/* Stock Badge */}
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10">
                    {inStock ? (
                      <span className="bg-green-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        Out
                      </span>
                    )}
                  </div>

                  {/* Product Image */}
                  <div className="h-32 sm:h-40 bg-gray-100 rounded-t-lg flex items-center justify-center p-2 sm:p-3">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = getPlaceholderSvg(200);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-2 sm:p-3">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1 truncate">{product.storeName || 'N/A'}</p>
                    <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-2 group-hover:text-blue-600">
                      {product.name}
                    </h3>
                    <div className="text-base sm:text-lg font-bold text-gray-900">${product.price}</div>
                    {inStock && (
                      <div className="text-[10px] sm:text-xs text-green-600 mt-0.5 sm:mt-1">
                        {product.quantity} available
                      </div>
                    )}
                    <button 
                      onClick={(e) => handleAddToCart(product.id, e)}
                      disabled={!inStock}
                      className={`w-full mt-1 sm:mt-2 px-2 sm:px-3 py-1.5 rounded text-[10px] sm:text-sm min-h-[36px] sm:min-h-[44px] ${
                        inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {inStock ? 'Add to Cart' : 'Out of Stock'}
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

export default CategoryPage;