import React from 'react';
import { Clock, CheckCircle, XCircle, Hourglass, CalendarClock, Calendar, Image } from 'lucide-react';
import { OrderCancellationRequest, RequestStatus } from '../../types';
import { motion } from 'framer-motion';

interface CancellationStatusProps {
  request: OrderCancellationRequest;
}

const CancellationStatus: React.FC<CancellationStatusProps> = ({ request }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status: RequestStatus) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: 'Request Approved',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-300'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          title: 'Request Rejected',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-300'
        };
      case 'pending':
      default:
        return {
          icon: <Clock className="w-5 h-5 text-yellow-500" />,
          title: 'Request Pending',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-300'
        };
    }
  };
  
  // Function to extract and display image URLs from the reason text
  const renderImagePreviews = () => {
    // Extract image URLs using regex
    const regex = /Images:\s*(https?:\/\/[^,\s]+(?:,\s*https?:\/\/[^,\s]+)*)/;
    const match = request.reason.match(regex);
    
    if (!match || !match[1]) return null;
    
    const imageUrls = match[1].split(',').map(url => url.trim());
    
    return (
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 dark:text-soft-white mb-2 flex items-center">
          <Image className="w-4 h-4 mr-1.5" /> Images:
        </h5>
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <a 
              key={index} 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-neon-blue dark:hover:border-neon-blue transition-colors"
            >
              <img 
                src={url} 
                alt={`Image ${index + 1}`} 
                className="h-24 w-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Error';
                }}
              />
            </a>
          ))}
        </div>
      </div>
    );
  };

  const statusConfig = getStatusConfig(request.status);
  
  // Function to format reason text, removing the image URLs section
  const formatReason = (reason: string) => {
    // Strip out the "Images: url1, url2" part
    return reason.replace(/\n\nImages:.*$/s, '');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg p-4`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bgColor} border ${statusConfig.borderColor}`}>
          {statusConfig.icon}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-medium ${statusConfig.textColor}`}>
            {request.type === 'cancel' ? 'Cancellation' : 'Replacement'} {statusConfig.title}
          </h3>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm text-gray-600 dark:text-soft-gray">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>Requested on {formatDate(request.created_at)}</span>
            </div>
            
            {request.status !== 'pending' && (
              <div className="flex items-center text-sm text-gray-600 dark:text-soft-gray">
                <CalendarClock className="w-4 h-4 mr-1.5" />
                <span>Processed on {formatDate(request.updated_at)}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <div className="flex items-start">
              <span className="text-sm font-medium text-gray-700 dark:text-soft-white mr-2">Reason:</span>
              <span className="text-sm text-gray-600 dark:text-soft-gray">{formatReason(request.reason)}</span>
            </div>
            
            {/* Display images if this is a replacement request and has images */}
            {request.type === 'exchange' && renderImagePreviews()}
            
            {request.admin_response && (
              <div className="mt-2 flex items-start">
                <span className="text-sm font-medium text-gray-700 dark:text-soft-white mr-2">Response:</span>
                <span className="text-sm text-gray-600 dark:text-soft-gray">{request.admin_response}</span>
              </div>
            )}
            
            {request.status === 'pending' && (
              <div className="mt-3 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                <Hourglass className="w-4 h-4 mr-1.5" />
                <span>Your request is being reviewed by our team</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CancellationStatus;