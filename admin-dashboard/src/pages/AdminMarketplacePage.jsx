/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8087/api';

function AdminMarketplacePage() {
  const [products, setProducts] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [marketplaceStats, setMarketplaceStats] = useState({
    amazon: 0,
    walmart: 0,
    ebay: 0,
    tiktok: 0,
    google: 0,
    etsy: 0,
    backmarket: 0,
    temu: 0,
    shopify: 0,
    total: 0
  });

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchProducts();
    fetchMarketplaceStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        await fetchAllListings();
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllListings = async () => {
    try {
      const listingsData = [];
      for (const product of products) {
        const response = await fetch(`${API_BASE_URL}/marketplace/products/${product.id}/listings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          listingsData.push({ productId: product.id, listings: data.listings || [] });
        }
      }
      setListings(listingsData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchMarketplaceStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMarketplaceStats(data);
      }
    } catch (error) {
      console.error('Error fetching marketplace stats:', error);
    }
  };

  const listProductToMarketplace = async (productId, marketplace) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ marketplace })
      });

      if (response.ok) {
        setMessage(`✅ Product listed to ${marketplace} successfully!`);
        fetchProducts();
        fetchMarketplaceStats();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data || 'Failed to list product'}`);
      }
    } catch (error) {
      console.error('Error listing product:', error);
      setMessage('❌ Error listing product');
    }
  };

  const listProductToAllMarketplaces = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/list-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage(`✅ Product listed to all marketplaces successfully!`);
        fetchProducts();
        fetchMarketplaceStats();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data || 'Failed to list product'}`);
      }
    } catch (error) {
      console.error('Error listing product:', error);
      setMessage('❌ Error listing product');
    }
  };

  const unlistProductFromMarketplace = async (productId, marketplace) => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/products/${productId}/unlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ marketplace })
      });

      if (response.ok) {
        setMessage(`✅ Product unlisted from ${marketplace} successfully!`);
        fetchProducts();
        fetchMarketplaceStats();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data || 'Failed to unlist product'}`);
      }
    } catch (error) {
      console.error('Error unlisting product:', error);
      setMessage('❌ Error unlisting product');
    }
  };

  const syncAllProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/marketplace/sync-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('✅ All products synced successfully!');
        fetchProducts();
      } else {
        const data = await response.json();
        setMessage(`❌ ${data || 'Failed to sync products'}`);
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      setMessage('❌ Error syncing products');
    }
  };

  const getProductListings = (productId) => {
    const productListings = listings.find(l => l.productId === productId);
    return productListings ? productListings.listings : [];
  };

  const isProductListedOn = (productId, marketplace) => {
    const productListings = getProductListings(productId);
    return productListings.some(l => l.marketplace === marketplace && l.isActive);
  };

  const getMarketplaceColor = (marketplace) => {
    const colors = {
      'AMAZON': 'bg-blue-600 hover:bg-blue-700',
      'WALMART': 'bg-yellow-600 hover:bg-yellow-700',
      'EBAY': 'bg-purple-600 hover:bg-purple-700',
      'TIKTOK': 'bg-black hover:bg-gray-800',
      'GOOGLE': 'bg-green-600 hover:bg-green-700',
      'ETSY': 'bg-pink-600 hover:bg-pink-700',
      'BACKMARKET': 'bg-orange-600 hover:bg-orange-700',
      'TEMU': 'bg-red-600 hover:bg-red-700',
      'SHOPIFY': 'bg-teal-600 hover:bg-teal-700'
    };
    return colors[marketplace] || 'bg-gray-600 hover:bg-gray-700';
  };

  const getMarketplaceDisplayName = (marketplace) => {
    const names = {
      'AMAZON': 'Amazon',
      'WALMART': 'Walmart',
      'EBAY': 'eBay',
      'TIKTOK': 'TikTok',
      'GOOGLE': 'Google',
      'ETSY': 'Etsy',
      'BACKMARKET': 'Backmarket',
      'TEMU': 'Temu',
      'SHOPIFY': 'Shopify'
    };
    return names[marketplace] || marketplace;
  };

  const getMarketplaceIcon = (marketplace) => {
    const icons = {
      'AMAZON': '🛒',
      'WALMART': '🛍️',
      'EBAY': '🏷️',
      'TIKTOK': '🎵',
      'GOOGLE': '🔍',
      'ETSY': '🎨',
      'BACKMARKET': '♻️',
      'TEMU': '📦',
      'SHOPIFY': '🛒'
    };
    return icons[marketplace] || '📦';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading marketplace data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">🌐 Marketplace Integration</h1>
        <button
          onClick={syncAllProducts}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-11"
        >
          Sync All Products
        </button>
      </div>

      {message && (
        <div className={`p-3 sm:p-4 rounded mb-4 text-sm ${message.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {message}
        </div>
      )}

      {/* Stats Cards - 9 Marketplaces - Mobile friendly */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">Amazon</div>
          <div className="text-base sm:text-2xl font-bold text-blue-600">{marketplaceStats.amazon}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">Walmart</div>
          <div className="text-base sm:text-2xl font-bold text-yellow-600">{marketplaceStats.walmart}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">eBay</div>
          <div className="text-base sm:text-2xl font-bold text-purple-600">{marketplaceStats.ebay}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">TikTok</div>
          <div className="text-base sm:text-2xl font-bold text-black">{marketplaceStats.tiktok}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">Google</div>
          <div className="text-base sm:text-2xl font-bold text-green-600">{marketplaceStats.google}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">Etsy</div>
          <div className="text-base sm:text-2xl font-bold text-pink-600">{marketplaceStats.etsy}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">Backmarket</div>
          <div className="text-base sm:text-2xl font-bold text-orange-600">{marketplaceStats.backmarket}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">Temu</div>
          <div className="text-base sm:text-2xl font-bold text-red-600">{marketplaceStats.temu}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <div className="text-[10px] sm:text-sm text-gray-500">Shopify</div>
          <div className="text-base sm:text-2xl font-bold text-teal-600">{marketplaceStats.shopify}</div>
        </div>
      </div>

      {/* Total Stats */}
      <div className="bg-blue-50 rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6 text-center">
        <span className="text-sm sm:text-lg font-semibold">📊 Total Listings: </span>
        <span className="text-xl sm:text-2xl font-bold text-blue-600">{marketplaceStats.total}</span>
        <span className="text-xs sm:text-sm text-gray-500 ml-2">across all 9 marketplaces</span>
      </div>

      {/* Products Table - Mobile friendly */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>A</th>
                <th>W</th>
                <th>E</th>
                <th>T</th>
                <th>G</th>
                <th>Et</th>
                <th>B</th>
                <th>Te</th>
                <th>S</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isAmazon = isProductListedOn(product.id, 'AMAZON');
                const isWalmart = isProductListedOn(product.id, 'WALMART');
                const isEbay = isProductListedOn(product.id, 'EBAY');
                const isTikTok = isProductListedOn(product.id, 'TIKTOK');
                const isGoogle = isProductListedOn(product.id, 'GOOGLE');
                const isEtsy = isProductListedOn(product.id, 'ETSY');
                const isBackmarket = isProductListedOn(product.id, 'BACKMARKET');
                const isTemu = isProductListedOn(product.id, 'TEMU');
                const isShopify = isProductListedOn(product.id, 'SHOPIFY');

                const marketplaces = [
                  { key: 'AMAZON', listed: isAmazon, label: 'A' },
                  { key: 'WALMART', listed: isWalmart, label: 'W' },
                  { key: 'EBAY', listed: isEbay, label: 'E' },
                  { key: 'TIKTOK', listed: isTikTok, label: 'T' },
                  { key: 'GOOGLE', listed: isGoogle, label: 'G' },
                  { key: 'ETSY', listed: isEtsy, label: 'Et' },
                  { key: 'BACKMARKET', listed: isBackmarket, label: 'B' },
                  { key: 'TEMU', listed: isTemu, label: 'Te' },
                  { key: 'SHOPIFY', listed: isShopify, label: 'S' }
                ];

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="font-medium text-xs sm:text-sm">{product.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">ID: {product.id}</div>
                    </td>
                    <td className="font-medium text-xs sm:text-sm">${product.price}</td>
                    {marketplaces.map((mp) => (
                      <td key={mp.key} className="text-center">
                        {mp.listed ? (
                          <span className="text-green-600 text-xs sm:text-sm">✅</span>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">❌</span>
                        )}
                      </td>
                    ))}
                    <td>
                      <div className="flex flex-wrap gap-0.5 sm:gap-1">
                        <button onClick={() => listProductToAllMarketplaces(product.id)} className="bg-green-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-green-700 min-h-7 sm:min-h-8">All</button>
                        {!isAmazon && <button onClick={() => listProductToMarketplace(product.id, 'AMAZON')} className="bg-blue-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-blue-700 min-h-7 sm:min-h-8">Am</button>}
                        {!isWalmart && <button onClick={() => listProductToMarketplace(product.id, 'WALMART')} className="bg-yellow-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-yellow-700 min-h-7 sm:min-h-8">Wa</button>}
                        {!isEbay && <button onClick={() => listProductToMarketplace(product.id, 'EBAY')} className="bg-purple-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-purple-700 min-h-7 sm:min-h-8">eB</button>}
                        {!isTikTok && <button onClick={() => listProductToMarketplace(product.id, 'TIKTOK')} className="bg-black text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-gray-800 min-h-7 sm:min-h-8">TT</button>}
                        {!isGoogle && <button onClick={() => listProductToMarketplace(product.id, 'GOOGLE')} className="bg-green-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-green-700 min-h-7 sm:min-h-8">Go</button>}
                        {!isEtsy && <button onClick={() => listProductToMarketplace(product.id, 'ETSY')} className="bg-pink-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-pink-700 min-h-7 sm:min-h-8">Et</button>}
                        {!isBackmarket && <button onClick={() => listProductToMarketplace(product.id, 'BACKMARKET')} className="bg-orange-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-orange-700 min-h-7 sm:min-h-8">Bm</button>}
                        {!isTemu && <button onClick={() => listProductToMarketplace(product.id, 'TEMU')} className="bg-red-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-red-700 min-h-7 sm:min-h-8">Te</button>}
                        {!isShopify && <button onClick={() => listProductToMarketplace(product.id, 'SHOPIFY')} className="bg-teal-600 text-white px-1 sm:px-2 py-0.5 rounded text-[8px] sm:text-xs hover:bg-teal-700 min-h-7 sm:min-h-8">Sh</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500 text-sm">
                    No products found. Create products first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 text-[10px] sm:text-sm text-gray-500 space-y-1">
        <p>💡 Click "All" to list on all 9 marketplaces</p>
        <p>💡 Individual buttons appear only if not already listed</p>
        <p>📌 Supported: Amazon, Walmart, eBay, TikTok, Google, Etsy, Backmarket, Temu, Shopify</p>
      </div>
    </div>
  );
}

export default AdminMarketplacePage;