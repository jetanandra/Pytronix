import React from 'react';
import { Star } from 'lucide-react';

interface RatingSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingCounts?: Record<number, number>;
  onFilterByRating?: (rating: number | null) => void;
  selectedRating: number | null;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ 
  averageRating, 
  totalReviews, 
  ratingCounts = {},
  onFilterByRating,
  selectedRating
}) => {
  // Calculate percentages for the rating bars
  const getPercentage = (rating: number) => {
    if (!totalReviews) return 0;
    const count = ratingCounts[rating] || 0;
    return (count / totalReviews) * 100;
  };

  return (
    <div className="bg-white dark:bg-light-navy rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="text-center mb-6 md:mb-0 md:mr-8">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {averageRating ? averageRating.toFixed(1) : "0.0"}
          </div>
          <div className="flex justify-center my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="w-4 h-4 text-yellow-400" 
                fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'} 
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 dark:text-soft-gray">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>
        
        <div className="flex-grow">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onFilterByRating && onFilterByRating(selectedRating === rating ? null : rating)}
              className={`flex items-center mb-2 w-full hover:bg-gray-50 dark:hover:bg-dark-navy p-1 rounded ${
                selectedRating === rating ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
              disabled={!onFilterByRating}
            >
              <div className="w-10 text-sm text-right text-gray-700 dark:text-soft-gray">
                {rating} <Star className="w-3 h-3 inline-block mb-0.5" />
              </div>
              <div className="mx-2 flex-grow h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-2.5 bg-yellow-400 rounded-full" 
                  style={{ width: `${getPercentage(rating)}%` }}
                ></div>
              </div>
              <div className="w-10 text-xs text-gray-600 dark:text-soft-gray">
                {ratingCounts[rating] || 0}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RatingSummary;