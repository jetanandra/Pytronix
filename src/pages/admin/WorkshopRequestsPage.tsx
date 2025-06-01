import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  ExternalLink, 
  MessageSquare,
  Users,
  User
} from 'lucide-react';
import { getAllWorkshopRequests, updateWorkshopRequestStatus } from '../../services/workshopService';
import { WorkshopRequest } from '../../types';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type RequestStatus = 'pending' | 'approved' | 'rejected';

const WorkshopRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<WorkshopRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WorkshopRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<WorkshopRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseAction, setResponseAction] = useState<'approve' | 'reject'>('approve');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllWorkshopRequests();
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error('Error fetching workshop requests:', error);
      toast.error('Failed to load workshop requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter requests based on search query and status filter
    let filtered = [...requests];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.institution_name.toLowerCase().includes(query) ||
        request.contact_name.toLowerCase().includes(query) ||
        request.contact_email.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    // Sort by created_at (newest first)
    filtered.sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime());
    
    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter]);

  const handleStatusChange = async (requestId: string, status: RequestStatus, message?: string) => {
    try {
      setProcessingId(requestId);
      await updateWorkshopRequestStatus(requestId, status, message);
      
      // Update local state
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req.id === requestId ? { ...req, status, admin_response: message || req.admin_response } : req
        )
      );
      
      toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowResponseModal(false);
      setResponseMessage('');
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

  const openResponseModal = (request: WorkshopRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setResponseAction(action);
    setResponseMessage(action === 'approve' 
      ? `Dear ${request.contact_name},\n\nWe're pleased to confirm your workshop request. Our team will contact you shortly to finalize the details.\n\nBest regards,\nPhytronix Team`
      : `Dear ${request.contact_name},\n\nThank you for your workshop request. Unfortunately, we are unable to accommodate your request at this time due to scheduling conflicts.\n\nBest regards,\nPhytronix Team`
    );
    setShowResponseModal(true);
  };

  const getStatusBadge = (status: RequestStatus) => {
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
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Workshop Requests
      </h1>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by institution or contact..."
            className="pl-10 w-full md:w-80 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'all')}
            className="bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            No Workshop Requests Found
          </h3>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            {searchQuery || statusFilter !== 'all'
              ? "No requests match your search criteria. Try adjusting your filters."
              : "There are no workshop requests in the system yet."}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className="bg-white dark:bg-light-navy rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(request.status as RequestStatus)}
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Workshop Request from {request.institution_name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-soft-gray">
                        <Building className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span>{request.institution_type}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-soft-gray">
                        <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span>{request.participants} participants</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-soft-gray">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        <span>
                          {request.preferred_dates.length} preferred date{request.preferred_dates.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => openResponseModal(request, 'approve')}
                          className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800/30 flex items-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                          Approve
                        </button>
                        <button 
                          onClick={() => openResponseModal(request, 'reject')}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800/30 flex items-center"
                        >
                          <XCircle className="w-4 h-4 mr-1.5" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpandedRequestId(expandedRequestId === request.id ? null : (request.id || ''))}
                      className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center"
                    >
                      <ChevronDown className="w-4 h-4 mr-1.5" />
                      {expandedRequestId === request.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedRequestId === request.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Contact Information</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{request.contact_name}</span>
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              <a href={`mailto:${request.contact_email || ''}`} className="text-neon-blue hover:underline">
                                {request.contact_email}
                              </a>
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              <a href={`tel:${request.contact_phone || ''}`} className="text-neon-blue hover:underline">
                                {request.contact_phone}
                              </a>
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <span className="font-semibold mr-2">User ID:</span>
                              <span>{request.user_id || 'N/A'}</span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Workshop Details</h4>
                          <ul className="space-y-2">
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <span className="font-semibold mr-2">Workshop:</span>
                              {request.workshop ? (
                                <>
                                  <span className="mr-2">{request.workshop.title}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">({request.workshop.duration})</span>
                                  <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs">{request.workshop.category}</span>
                                </>
                              ) : (
                                <span>{request.workshop_id}</span>
                              )}
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <Building className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{request.institution_name} ({request.institution_type})</span>
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{request.participants} participants</span>
                            </li>
                            <li className="flex items-center text-gray-600 dark:text-soft-gray">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              <span>Preferred Dates:</span>
                            </li>
                            <li className="ml-6">
                              <div className="flex flex-wrap gap-2">
                                {request.preferred_dates.map((date, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
                                  >
                                    {new Date(date || '').toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                ))}
                              </div>
                            </li>
                            {request.additional_requirements && (
                              <>
                                <li className="flex items-start mt-3">
                                  <MessageSquare className="w-4 h-4 mr-2 text-gray-400 mt-1" />
                                  <span className="text-gray-600 dark:text-soft-gray">Additional Requirements:</span>
                                </li>
                                <li className="ml-6 text-gray-600 dark:text-soft-gray">
                                  {request.additional_requirements}
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      {request.admin_response && (
                        <div className={`mt-4 p-4 rounded-lg ${
                          request.status === 'approved' 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Response Message:</h4>
                          <p className="text-gray-600 dark:text-soft-gray whitespace-pre-line">
                            {request.admin_response}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {responseAction === 'approve' ? 'Approve Request' : 'Reject Request'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                  Response Message
                </label>
                <textarea
                  value={responseMessage || ''}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  placeholder="Enter your response to the requester..."
                ></textarea>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  This message will be sent to the requester via email
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange(
                    selectedRequest.id || '',
                    responseAction === 'approve' ? 'approved' : 'rejected',
                    responseMessage
                  )}
                  disabled={!responseMessage.trim() || processingId === selectedRequest.id}
                  className={`px-4 py-2 rounded-lg ${
                    responseAction === 'approve'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {processingId === selectedRequest.id ? (
                    <LoaderSpinner size="sm" color="blue" />
                  ) : (
                    responseAction === 'approve' ? 'Approve Request' : 'Reject Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopRequestsPage;