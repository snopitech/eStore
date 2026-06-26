/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8087/api';

function AdminInventorySourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    apiEndpoint: '',
    apiKey: '',
    commissionRate: 5.0
  });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/inventory-sources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSources(data);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const url = editingId
        ? `${API_BASE_URL}/admin/inventory-sources/${editingId}`
        : `${API_BASE_URL}/admin/inventory-sources`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          commissionRate: parseFloat(formData.commissionRate)
        })
      });

      if (response.ok) {
        setMessage(editingId ? '✅ Source updated successfully!' : '✅ Source added successfully!');
        setShowForm(false);
        setEditingId(null);
        setFormData({
          name: '',
          description: '',
          website: '',
          contactEmail: '',
          contactPhone: '',
          apiEndpoint: '',
          apiKey: '',
          commissionRate: 5.0
        });
        fetchSources();
      } else {
        const data = await response.json();
        setMessage('❌ ' + (data || 'Failed to save source'));
      }
    } catch (error) {
      console.error('Error saving source:', error);
      setMessage('❌ Error saving source');
    }
  };

  const handleEdit = (source) => {
    setEditingId(source.id);
    setFormData({
      name: source.name || '',
      description: source.description || '',
      website: source.website || '',
      contactEmail: source.contactEmail || '',
      contactPhone: source.contactPhone || '',
      apiEndpoint: source.apiEndpoint || '',
      apiKey: source.apiKey || '',
      commissionRate: source.commissionRate || 5.0
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this source?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/inventory-sources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage('✅ Source deleted successfully');
        fetchSources();
      } else {
        const data = await response.json();
        setMessage('❌ ' + (data || 'Failed to delete source'));
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      setMessage('❌ Error deleting source');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const action = currentStatus ? 'deactivate' : 'activate';
      const response = await fetch(`${API_BASE_URL}/admin/inventory-sources/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMessage(`✅ Source ${action}d successfully`);
        fetchSources();
      } else {
        const data = await response.json();
        setMessage('❌ ' + (data || 'Failed to update status'));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('❌ Error updating status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl">Loading inventory sources...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">📦 Inventory Sources</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingId(null);
              setFormData({
                name: '',
                description: '',
                website: '',
                contactEmail: '',
                contactPhone: '',
                apiEndpoint: '',
                apiKey: '',
                commissionRate: 5.0
              });
            }
          }}
          className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 text-sm sm:text-base min-h-11"
        >
          + Add Source
        </button>
      </div>

      {message && (
        <div className={`p-3 sm:p-4 rounded mb-4 text-sm ${message.includes('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
          {message}
        </div>
      )}

      {/* Add/Edit Form - Mobile Friendly */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">{editingId ? 'Edit Source' : 'Add New Source'}</h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Source Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-11"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-11"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-15"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-11"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-11"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Contact Phone</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-11"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">API Endpoint</label>
                <input
                  type="url"
                  name="apiEndpoint"
                  value={formData.apiEndpoint}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-11"
                  placeholder="https://api.supplier.com/v1"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-11"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-sm min-h-11"
              >
                {editingId ? 'Update Source' : 'Add Source'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400 text-sm min-h-11"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sources List - Mobile Friendly */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sources.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <p className="text-sm sm:text-base">No inventory sources added yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm min-h-11"
            >
              Add Your First Source
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Commission</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <div className="font-medium text-xs sm:text-sm">{source.name}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">{source.description}</div>
                    </td>
                    <td className="font-medium text-blue-600 text-xs sm:text-sm">{source.commissionRate}%</td>
                    <td>
                      <div className="text-xs sm:text-sm">{source.contactEmail}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">{source.contactPhone}</div>
                    </td>
                    <td>
                      <span className={`px-2 py-1 rounded text-[8px] sm:text-xs ${
                        source.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => handleEdit(source)} className="text-blue-600 hover:underline text-[10px] sm:text-sm min-h-8">Edit</button>
                        <button onClick={() => handleToggleActive(source.id, source.isActive)} className={`text-[10px] sm:text-sm min-h-8 ${source.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}>
                          {source.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(source.id)} className="text-red-600 hover:underline text-[10px] sm:text-sm min-h-8">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminInventorySourcesPage;