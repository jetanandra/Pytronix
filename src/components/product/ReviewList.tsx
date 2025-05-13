import React, { useState } from 'react';
import { Star, ThumbsUp, Trash, Edit, User, CheckCircle } from 'lucide-react';
import { ProductReview } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { voteReviewHelpful, deleteReview } from '../../services/reviewService';
import { toast } from 'react-hot-toast';
import LoaderSpinner from '../ui/LoaderSpinner';

interface ReviewListProps {
  reviews: ProductReview[];
  onRefresh: () => void;
  onEditReview: (review: ProductReview) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, onRefresh, onEditReview }) => {
  const { user } = useAuth();
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const handleVoteHelpful = async (reviewId: string) => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return;
    }
    
    try {
      setVotingReviewId(reviewId);
      await voteReviewHelpful(reviewId);
      onRefresh();
      toast.success('Thanks for your feedback!');
    } catch (error) {
      console.error('Error voting review helpful:', error);
      toast.error('Failed to register your vote');
    } finally {
      setVotingReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        setDeletingReviewId(reviewId);
        await deleteReview(reviewId);
        onRefresh();
        toast.success('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      } finally {
        setDeletingReviewId(null);
      }
    }
  };

  // Sort reviews: verified purchases first, then by helpful votes, then by date
  const sortedReviews = [...reviews].sort((a, b) => {
    // First sort by verified purchase
    if (a.is_verified_purchase && !b.is_verified_purchase) return -1;
    if (!a.is_verified_purchase && b.is_verified_purchase) return 1;
    
    // Then by helpful votes
    if (a.helpful_votes !== b.helpful_votes) return b.helpful_votes - a.helpful_votes;
    
    // Then by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  // Format relative time
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffYear > 0) return `${diffYear} ${diffYear === 1 ? 'year' : 'years'} ago`;
    if (diffMonth > 0) return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
    if (diffDay > 0) return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    if (diffHour > 0) return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    if (diffMin > 0) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    return 'Just now';
  };

  // Function to extract email username (before @)
  const getDisplayName = (review: ProductReview) => {
    if (review.user?.full_name) return review.user.full_name;
    if (review.user?.email) return review.user.email.split('@')[0];
    return "Anonymous User";
  };

  return (
    <div className="space-y-6">
      {sortedReviews.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <Star className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        sortedReviews.map((review) => (
          <div 
            key={review.id} 
            className="border-b border-gray-200 dark:border-gray-700 pb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {getDisplayName(review)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getRelativeTime(review.created_at)}
                  </div>
                </div>
              </div>
              
              {review.is_verified_purchase && (
                <div className="flex items-center text-green-600 dark:text-green-500 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Purchase
                </div>
              )}
            </div>
            
            <div className="mb-2 flex items-center">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="w-4 h-4 mr-0.5 text-yellow-400" 
                    fill={star <= review.rating ? 'currentColor' : 'none'} 
                  />
                ))}
              </div>
              {review.title && (
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{review.title}</span>
              )}
            </div>
            
            <div className="text-gray-700 dark:text-soft-gray whitespace-pre-line mb-4">
              {review.content}
            </div>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={() => handleVoteHelpful(review.id)}
                disabled={votingReviewId === review.id || (user?.id === review.user_id)}
                className={`text-xs flex items-center ${
                  votingReviewId === review.id || (user?.id === review.user_id)
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:text-neon-blue dark:hover:text-neon-blue'
                }`}
              >
                {votingReviewId === review.id ? (
                  <LoaderSpinner size="sm" color="blue" />
                ) : (
                  <>
                    <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                    Helpful {review.helpful_votes > 0 && <span className="ml-1">({review.helpful_votes})</span>}
                  </>
                )}
              </button>
              
              {user && user.id === review.user_id && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => onEditReview(review)}
                    className="text-xs flex items-center text-neon-blue hover:text-blue-700 dark:hover:text-blue-400"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingReviewId === review.id}
                    className="text-xs flex items-center text-red-600 hover:text-red-700 dark:hover:text-red-400"
                  >
                    {deletingReviewId === review.id ? (
                      <LoaderSpinner size="sm" color="red" />
                    ) : (
                      <>
                        <Trash className="w-3.5 h-3.5 mr-1.5" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;