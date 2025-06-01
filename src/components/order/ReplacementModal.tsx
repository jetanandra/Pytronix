import React, { useState, useRef } from 'react';
import { X, AlertTriangle, Send, Upload, Trash, Camera, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { ReplacementReason } from '../../types';
import { submitCancellationRequest } from '../../services/cancellationService';
import { supabase } from '../../lib/supabaseClient';
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
  const [images, setImages] = useState<{url: string, file?: File}[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Method to add image URL
  const addImageUrl = () => {
    if (newImageUrl.trim() && images.length < 3) {
      setImages([...images, { url: newImageUrl.trim() }]);
      setNewImageUrl('');
    }
  };

  // Method to handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file is an image and size is reasonable (< 5MB)
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    // Check if we've reached the limit
    if (images.length >= 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create a temporary object URL for preview
      const objectUrl = URL.createObjectURL(file);
      
      // Add to images array with the file and temporary URL
      setImages([...images, { url: objectUrl, file }]);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error handling file:', err);
      toast.error('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    // If this image has an object URL, revoke it to prevent memory leaks
    const image = images[index];
    if (image.file) {
      URL.revokeObjectURL(image.url);
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    // Filter out images that are just URLs (no files)
    const imagesToUpload = images.filter(img => img.file);
    
    // If no images to upload, return the existing URLs
    if (imagesToUpload.length === 0) {
      return images.map(img => img.url);
    }
    
    try {
      // First check if bucket exists, if not create it
      const { error: bucketError } = await supabase.storage.getBucket('replacement-images');
      
      if (bucketError) {
        console.log('Bucket not found, attempting to create it');
        const { error: createBucketError } = await supabase.storage.createBucket('replacement-images', {
          public: true
        });
        
        if (createBucketError) {
          throw new Error(`Bucket not found: ${createBucketError.message}`);
        }
      }
      
      // Upload images to Supabase Storage
      const uploadPromises = imagesToUpload.map(async (img) => {
        if (!img.file) return img.url;
        
        const filename = `${Date.now()}-${img.file.name.replace(/\s+/g, '_')}`;
        const { data, error } = await supabase.storage
          .from('replacement-images')
          .upload(`${orderId}/${filename}`, img.file);
        
        if (error) {
          console.error('Error uploading image:', error);
          throw new Error(`Failed to upload image: ${error.message}`);
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('replacement-images')
          .getPublicUrl(`${orderId}/${filename}`);
          
        return publicUrl;
      });
      
      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Combine uploaded URLs with existing URL-only images
      return images.map((img, index) => {
        if (img.file) {
          return uploadedUrls[imagesToUpload.indexOf(img)];
        }
        return img.url;
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
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
      
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        try {
          imageUrls = await uploadImages();
        } catch (err) {
          console.error('Error uploading images:', err);
          toast.error('Error uploading images: ' + (err instanceof Error ? err.message : String(err)));
          setLoading(false);
          return;
        }
      }
      
      // Format the detailed reason with images
      let detailedReason = reason;
      if (description) {
        detailedReason += `\n\nDetails: ${description}`;
      }
      
      if (imageUrls.length > 0) {
        detailedReason += `\n\nImages: ${imageUrls.join(', ')}`;
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
        className="w-full max-w-md bg-white dark:bg-light-navy rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
              
              {/* Two-tab interface for adding images */}
              <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex border-b border-gray-300 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 px-4 flex justify-center items-center gap-2 bg-gray-50 dark:bg-dark-navy text-neon-blue hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={images.length >= 3 || uploading}
                  >
                    <Camera className="w-5 h-5" />
                    <span>Upload Photo</span>
                  </button>
                  
                  <div className="h-8 my-auto border-r border-gray-300 dark:border-gray-700"></div>
                  
                  <button
                    type="button"
                    onClick={() => document.getElementById('image-url-input')?.focus()}
                    className="flex-1 py-3 px-4 flex justify-center items-center gap-2 bg-gray-50 dark:bg-dark-navy text-neon-blue hover:bg-gray-100 dark:hover:bg-gray-800"
                    disabled={images.length >= 3}
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Image URL</span>
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={images.length >= 3}
                />
                
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="image-url-input"
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-grow px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                      disabled={images.length >= 3}
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      disabled={!newImageUrl.trim() || images.length >= 3}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-neon-blue rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {uploading && (
                <div className="mt-2 flex justify-center">
                  <LoaderSpinner size="sm" color="blue" />
                </div>
              )}
              
              {/* Image Previews */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img 
                        src={img.url} 
                        alt={`Product issue ${index + 1}`} 
                        className="h-full w-full object-contain" 
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Error';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 3 - images.length) }).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Attach clear photos of the issue (up to 3 images, max 5MB each)
              </p>
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
                  disabled={loading || uploading || !reason || !description}
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