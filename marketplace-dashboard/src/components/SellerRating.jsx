/* eslint-disable no-unused-vars */
import React from 'react';

function SellerRating({ seller }) {
  if (!seller) return null;

  const { averageRating, totalReviews, positiveReviews } = seller;
  
  // Calculate positive percentage
  const positivePercentage = totalReviews > 0 
    ? Math.round((positiveReviews / totalReviews) * 100) 
    : 0;

  // Get star display
  const getStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    return (
      <>
        {'★'.repeat(fullStars)}
        {halfStar === 1 && '☆'}
        {'★'.repeat(emptyStars)}
      </>
    );
  };

  return (
    <div className="flex items-center gap-4">
      {/* Rating Stars */}
      <div className="flex items-center gap-1">
        <div className="text-yellow-400 text-lg">
          {getStars(averageRating || 0)}
        </div>
        <span className="text-sm font-bold text-gray-700 ml-1">
          {averageRating ? averageRating.toFixed(1) : '0.0'}
        </span>
      </div>

      {/* Review Count */}
      <div className="text-sm text-gray-500">
        ({totalReviews || 0} reviews)
      </div>

      {/* Positive Percentage */}
      {totalReviews > 0 && (
        <div className="text-sm text-green-600">
          {positivePercentage}% positive
        </div>
      )}
    </div>
  );
}

export default SellerRating;