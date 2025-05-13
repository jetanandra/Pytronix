import React, { useState } from 'react';
import { X, AlertTriangle, Send, Upload, Trash } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ReplacementReason } from '../../types';
import { submitCancellationRequest } from '../../services/cancellationService';
import LoaderSpinner from '../ui/LoaderSpinner';

interface ReplacementModalProps {
  orderId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const replacementReasons: { value: ReplacementReason; label: string }[] = [
  { value: 'defective_product', label: 'Product is defective' },
  { value: 'damaged_on_arrival', label: 'Product arrived damaged' },
  { value: 'wrong_item_received', label: 'Received wrong item' },
  { value: 'missing_parts', label: 'Missing parts/accessories' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'other', label: 'Other (please specify)' },
];

const ReplacementModal: React.FC<ReplacementModalProps> = ({ orderId, onClose, onSubmit }) => {
  const [reason, setReason] = useState<ReplacementReason | ''>('');
  const [description, setDescription] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addImage = () => {
    if (newImage.trim() && images.length < 3) {
      setImages([...images, newImage.trim()]);
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for replacement');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format the detailed reason with images
      let detailedReason = reason;
      if (description) {
        detailedReason += `\n\nDetails: ${description}`;
      }
      
      if (images.length > 0) {
        detailedReason += `\n\nImages: ${images.join(', ')}`;
      }
      
      await submitCancellationRequest(
        orderId,
        'exchange',
        detailedReason
      );
      
      toast.success('Replacement request submitted successfully');
      onSubmit();
    } catch (err) {
      console.error('Error submitting replacement request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit replacement request');
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Replacement</h2>
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
                Reason for Replacement <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReplacementReason)}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg transition"
                required
              >
                <option value="">Select a reason</option>
                {replacementReasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg transition"
                rows={3}
                required
                placeholder="Please describe the issue in detail..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                Add Photos (Up to 3)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addImage}
                  disabled={!newImage.trim() || images.length >= 3}
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-neon-blue rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mt-3 space-y-2">
                {images.map((img, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-dark-navy p-2 rounded-lg">
                    <div className="flex items-center overflow-hidden">
                      <div className="h-10 w-10 flex-shrink-0 mr-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <img src={img} alt="Product issue" className="h-full w-full object-cover" onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/40x40?text=Error';
                        }} />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-soft-gray truncate flex-1">{img}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once submitted, your replacement request will be reviewed by our team. Please keep the original packaging and product until your request is processed.
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
                  disabled={loading || !reason || !description}
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

export default ReplacementModal;