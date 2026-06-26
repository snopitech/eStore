/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://estore.snopitech.com/api';

function ProductVariations({ productId, onVariationSelect, selectedVariation }) {
  const { token } = useAuth();
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedVariations, setGroupedVariations] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [variationPrice, setVariationPrice] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchVariations();
    }
  }, [productId]);

  useEffect(() => {
    if (Object.keys(groupedVariations).length > 0) {
      // Set default selections
      const defaultOptions = {};
      Object.keys(groupedVariations).forEach(type => {
        if (groupedVariations[type].length > 0) {
          defaultOptions[type] = groupedVariations[type][0].variationValue;
        }
      });
      setSelectedOptions(defaultOptions);
    }
  }, [groupedVariations]);

  useEffect(() => {
    // Find the matching variation based on selected options
    if (Object.keys(selectedOptions).length > 0 && variations.length > 0) {
      const matched = variations.find(v => {
        return Object.keys(selectedOptions).every(type => 
          v.variationType === type && v.variationValue === selectedOptions[type]
        );
      });
      if (matched) {
        setVariationPrice(matched);
        onVariationSelect(matched);
      }
    }
  }, [selectedOptions, variations]);

  const fetchVariations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/variations?activeOnly=true`);
      if (response.ok) {
        const data = await response.json();
        setVariations(data.variations || []);
        
        // Group by variation type
        const grouped = {};
        (data.variations || []).forEach(v => {
          if (!grouped[v.variationType]) {
            grouped[v.variationType] = [];
          }
          grouped[v.variationType].push(v);
        });
        setGroupedVariations(grouped);
      }
    } catch (error) {
      console.error('Error fetching variations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (type, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading variations...</div>;
  }

  if (variations.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {Object.keys(groupedVariations).map((type) => (
        <div key={type}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </label>
          <div className="flex flex-wrap gap-2">
            {groupedVariations[type].map((variation) => {
              const isSelected = selectedOptions[type] === variation.variationValue;
              const inStock = variation.quantity > 0 && variation.isActive;
              
              return (
                <button
                  key={variation.id}
                  onClick={() => handleOptionSelect(type, variation.variationValue)}
                  disabled={!inStock}
                  className={`px-4 py-2 border rounded-md text-sm transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : inStock
                        ? 'border-gray-300 hover:border-blue-400 text-gray-700'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {variation.variationValue}
                  {!inStock && (
                    <span className="ml-1 text-xs text-red-500">(Out of Stock)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {variationPrice && variationPrice.priceAdjustment > 0 && (
        <div className="text-sm text-gray-600">
          +${variationPrice.priceAdjustment.toFixed(2)} for this selection
        </div>
      )}
    </div>
  );
}

export default ProductVariations;
