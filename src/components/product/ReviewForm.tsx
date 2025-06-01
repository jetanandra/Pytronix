import React, { useState, useEffect } from 'react';
import { Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { ProductReview } from '../../types';
import { createReview, updateReview, checkVerifiedPurchase } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import LoaderSpinner from '../ui/LoaderSpinner';
import Modal from '../ui/Modal';

interface ReviewFormProps {
  productId: string;
  existingReview?: ProductReview;
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, existingReview, onSubmitSuccess, onCancel }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isVerifiedPurchase, setIsVerifiedPurchase] = useState(existingReview?.is_verified_purchase || false);
  const [modal, setModal] = useState<{ open: boolean; type: 'error' | 'info' | 'success' | 'warning'; message: string }>({ open: false, type: 'info', message: '' });
  
  // Check if the user has purchased the product
  useEffect(() => {
    const checkPurchase = async () => {
      if (user && productId && !existingReview) {
        setLoading(true);
        try {
          const verified = await checkVerifiedPurchase(productId);
          setIsVerifiedPurchase(verified);
        } catch (error) {
          console.error('Error checking verified purchase:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkPurchase();
  }, [user, productId, existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setModal({ open: true, type: 'error', message: 'You must be logged in to submit a review' });
      return;
    }
    
    if (!content.trim()) {
      setModal({ open: true, type: 'warning', message: 'Please write a review' });
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (existingReview) {
        await updateReview(existingReview.id, {
          rating,
          title: title.trim() || null,
          content: content.trim()
        });
        setModal({ open: true, type: 'success', message: 'Review updated successfully' });
      } else {
        await createReview({
          product_id: productId,
          rating,
          title: title.trim() || null,
          content: content.trim(),
          is_verified_purchase: isVerifiedPurchase
        });
        setModal({ open: true, type: 'success', message: 'Review submitted successfully' });
      }
      
      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      setModal({ open: true, type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <LoaderSpinner size="md" color="blue" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-dark-navy rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      {isVerifiedPurchase && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-green-700 dark:text-green-300">
            You purchased this product, your review will be marked as verified!
          </p>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
          Rating
        </label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 focus:outline-none"
              aria-label={`${star} stars`}
            >
              <Star 
                className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                fill={star <= rating ? 'currentColor' : 'none'} 
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
          placeholder="Summarize your experience"
          maxLength={100}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
          Review Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
          placeholder="Share your experience with this product..."
        />
      </div>
      
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? <LoaderSpinner size="sm" color="blue" /> : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
      {modal.open && (
        <Modal
          open={modal.open}
          type={modal.type}
          message={modal.message}
          onClose={() => setModal({ ...modal, open: false })}
        />
      )}
    </form>
  );
};

export default ReviewForm;