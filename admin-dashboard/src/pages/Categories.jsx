/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const API_BASE_URL = 'http://localhost:8087/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (!formData.name.trim()) {
        setError('Category name is required');
        return;
      }

      console.log('Creating category:', formData);
      const result = await api.createCategory(formData);
      console.log('API response:', result);
      
      if (result && result.id) {
        setSuccess('✅ Category created successfully!');
        setShowForm(false);
        setFormData({ name: '', slug: '', description: '' });
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      setError(error.message || 'Failed to create category. Please try again.');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const result = await api.deleteCategory(categoryId);
      console.log('Delete result:', result);
      
      // Check if deletion was successful
      if (result.success !== false || result.message?.includes('deleted')) {
        alert('✅ Category deleted successfully!');
        fetchCategories();
      } else {
        alert(result.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-sm sm:text-base">Loading categories...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Categories Management</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setSuccess('');
          }}
          className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base min-h-11"
        >
          + Add Category
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">New Category</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 text-sm">
              ❌ {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm sm:text-base min-h-11"
                placeholder="Enter category name"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2 text-sm sm:text-base min-h-11"
                placeholder="Auto-generated from name"
              />
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Leave blank to auto-generate</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full border rounded px-3 py-2 text-sm sm:text-base min-h-15"
                placeholder="Enter category description"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button type="submit" className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-700 text-sm sm:text-base min-h-11">
                Create Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError('');
                }}
                className="bg-gray-300 px-4 sm:px-6 py-2 rounded hover:bg-gray-400 text-sm sm:text-base min-h-11"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="text-xs sm:text-sm">{cat.id}</td>
                  <td className="font-medium text-xs sm:text-sm">{cat.name}</td>
                  <td className="text-xs sm:text-sm">{cat.slug}</td>
                  <td className="text-xs sm:text-sm">{cat.description || '—'}</td>
                  <td>
                    {cat.isActive !== false ? (
                      <span className="px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-xs bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-xs bg-red-100 text-red-800">Inactive</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-[10px] sm:text-sm hover:bg-red-700 min-h-8"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">
                    No categories found. Create your first category!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Categories;