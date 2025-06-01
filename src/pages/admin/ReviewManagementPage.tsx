import React, { useState, useEffect } from 'react';
import { getAllReviews, deleteReview } from '../../services/reviewService';
import { ProductReview } from '../../types';
import { Star, Trash, CheckCircle, ExternalLink, Search, Filter, Copy } from 'lucide-react';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ReviewManagementPage: React.FC = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        setDeletingReviewId(reviewId);
        await deleteReview(reviewId);
        fetchReviews();
        toast.success('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      } finally {
        setDeletingReviewId(null);
      }
    }
  };

  // Function to extract email username or get display name
  const getDisplayName = (review: ProductReview) => {
    if (review.user?.full_name) return review.user.full_name;
    if (review.user?.email) return review.user.email;
    if (review.user_id) return review.user_id.substring(0, 8) + '...';
    return "Anonymous User";
  };
  
  const handleCopyUserId = (userId: string) => {
    navigator.clipboard.writeText(userId);
    toast.success('User ID copied to clipboard!');
  };
  
  const filteredReviews = reviews.filter(review => {
    let matches = true;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        review.content.toLowerCase().includes(query) ||
        (review.title?.toLowerCase() || '').includes(query) ||
        (getDisplayName(review).toLowerCase() || '').includes(query)
      );
    }
    
    // Apply rating filter
    if (ratingFilter !== null) {
      matches = matches && review.rating === ratingFilter;
    }
    
    // Apply verified purchase filter
    if (verifiedFilter !== null) {
      matches = matches && review.is_verified_purchase === verifiedFilter;
    }
    
    return matches;
  });
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Review Management
      </h1>
      
      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-80 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
          />
        </div>
        
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-gray-700 dark:text-gray-300 mr-2">Rating:</span>
            <select
              value={ratingFilter === null ? '' : ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1"
            >
              <option value="">All</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-700 dark:text-gray-300 mr-2">Purchase:</span>
            <select
              value={verifiedFilter === null ? '' : verifiedFilter ? 'verified' : 'unverified'}
              onChange={(e) => {
                if (e.target.value === '') setVerifiedFilter(null);
                else if (e.target.value === 'verified') setVerifiedFilter(true);
                else if (e.target.value === 'unverified') setVerifiedFilter(false);
              }}
              className="bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1"
            >
              <option value="">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Reviews Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoaderSpinner size="lg" color="blue" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-light-navy p-8 rounded-lg shadow text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No reviews found matching your criteria
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-navy">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-light-navy divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-dark-navy/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/product/${review.product_id}`}
                        className="text-neon-blue hover:underline flex items-center"
                        target="_blank"
                      >
                        <span className="truncate max-w-[120px]">{review.product_id.substr(0, 8)}...</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col items-start">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getDisplayName(review)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {review.user_id ? (
                            <>
                              ID: {review.user_id.substring(0, 8)}...
                              <button
                                className="ml-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-navy"
                                title="Copy full User ID"
                                onClick={() => handleCopyUserId(review.user_id)}
                                type="button"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-neon-blue" />
                              </button>
                            </>
                          ) : ''}
                        </div>
                        {review.is_verified_purchase && (
                          <CheckCircle className="w-4 h-4 ml-1.5 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                            fill={star <= review.rating ? 'currentColor' : 'none'} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {review.title && (
                          <p className="font-medium text-gray-900 dark:text-white mb-1">{review.title}</p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {review.content}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={deletingReviewId === review.id}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        {deletingReviewId === review.id ? (
                          <LoaderSpinner size="sm" color="blue" />
                        ) : (
                          <Trash className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagementPage;