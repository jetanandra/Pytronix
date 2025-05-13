import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCancellationRequests, updateCancellationRequest } from '../../services/cancellationService';
import { Clock, CheckCircle, XCircle, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { OrderCancellationRequest } from '../../types';

const OrderCancellationsPage: React.FC = () => {
  const [requests, setRequests] = useState<OrderCancellationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllCancellationRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching cancellation requests:', error);
      setError('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId: string, status: 'approved' | 'rejected', adminResponse: string = '') => {
    try {
      await updateCancellationRequest(requestId, status, adminResponse);
      toast.success(`Request ${status}`);
      fetchRequests(); // Refresh data
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Cancellation & Replacement Requests
      </h1>

      {requests.length === 0 ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            No Requests Found
          </h3>
          <p className="text-gray-600 dark:text-soft-gray mb-4">
            There are no cancellation or replacement requests at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map(request => (
            <div 
              key={request.id} 
              className="bg-white dark:bg-light-navy rounded-lg shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(request.status)}
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {request.type === 'cancel' ? 'Cancellation Request' : 'Replacement Request'}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-soft-gray">
                        <span className="font-medium">Order ID:</span>{' '}
                        <Link to={`/admin/orders/${request.order_id}`} className="text-neon-blue hover:underline">
                          {request.order_id.substring(0, 8)}...
                        </Link>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-soft-gray mt-1">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleUpdateRequest(request.id, 'approved', 'Your request has been approved. We will process it shortly.')}
                          className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800/30 flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateRequest(request.id, 'rejected', 'Your request has been rejected. Please contact support for more information.')}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800/30 flex items-center"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Reject
                        </button>
                      </>
                    )}
                    <Link 
                      to={`/admin/orders/${request.order_id}`}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      View Order
                    </Link>
                  </div>
                </div>
                
                {(request.status === 'approved' || request.status === 'rejected') && request.admin_response && (
                  <div className={`mt-3 p-3 rounded ${
                    request.status === 'approved' 
                      ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' 
                      : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'
                  }`}>
                    <p className="text-sm text-gray-700 dark:text-soft-gray">
                      <span className="font-medium">Admin Response:</span> {request.admin_response}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderCancellationsPage;