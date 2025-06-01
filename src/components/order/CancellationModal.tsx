import React, { useState } from 'react';
import { X, AlertTriangle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CancellationReason } from '../../types';
import { submitCancellationRequest } from '../../services/cancellationService';
import LoaderSpinner from '../ui/LoaderSpinner';

interface CancellationModalProps {
  orderId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const cancellationReasons: { value: CancellationReason; label: string }[] = [
  { value: 'changed_mind', label: 'I changed my mind' },
  { value: 'found_better_price', label: 'Found better price elsewhere' },
  { value: 'ordered_by_mistake', label: 'Ordered by mistake' },
  { value: 'wrong_item', label: 'Wrong item ordered' },
  { value: 'other', label: 'Other (please specify)' },
];

const CancellationModal: React.FC<CancellationModalProps> = ({ orderId, onClose, onSubmit }) => {
  const [reason, setReason] = useState<CancellationReason | ''>('');
  const [comments, setComments] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for cancellation');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // If reason is 'other', use the comments as the reason
      const finalReason = reason === 'other' ? comments : reason;
      
      await submitCancellationRequest(
        orderId,
        'cancel',
        finalReason
      );
      
      toast.success('Cancellation request submitted successfully');
      onSubmit();
    } catch (err) {
      console.error('Error submitting cancellation:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit cancellation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md bg-white dark:bg-light-navy rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Cancellation</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as CancellationReason)}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg transition"
                required
              >
                <option value="">Select a reason</option>
                {cancellationReasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            
            {reason === 'other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Additional Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg transition"
                  rows={3}
                  required
                  placeholder="Please explain why you want to cancel this order..."
                />
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once submitted, your cancellation request will be reviewed. You'll receive a notification when your request is processed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-50 dark:hover:bg-dark-navy/60 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason || (reason === 'other' && !comments)}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <LoaderSpinner size="sm" color="blue" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CancellationModal;