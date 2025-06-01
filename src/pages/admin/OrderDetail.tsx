import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus, deleteOrder, updateOrderTracking } from '../../services/orderService';
import { getCancellationRequestsByOrderId, updateCancellationRequest } from '../../services/cancellationService';
import { Order, OrderStatus, OrderCancellationRequest } from '../../types';
import { 
  ArrowLeft, 
  Package, 
  TruckIcon, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ShoppingBag,
  CalendarRange,
  AlertTriangle,
  Printer,
  LinkIcon,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon
} from 'lucide-react';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { getProfile } from '../../services/profileService';
import { supabase } from '../../lib/supabaseClient';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellationRequests, setCancellationRequests] = useState<OrderCancellationRequest[]>([]);
  
  // Tracking information state
  const [trackingId, setTrackingId] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');
  const [shippingCarrier, setShippingCarrier] = useState<string>('');
  const [showTrackingForm, setShowTrackingForm] = useState<boolean>(false);
  const [updatingTracking, setUpdatingTracking] = useState<boolean>(false);
  
  // Cancellation response state
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected'>('approved');
  const [adminResponse, setAdminResponse] = useState<string>('');
  const [showResponseForm, setShowResponseForm] = useState<boolean>(false);
  const [processingResponse, setProcessingResponse] = useState<boolean>(false);

  const [customerProfile, setCustomerProfile] = useState<{ full_name: string; email: string; phone: string | null } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("Order ID is required");
          return;
        }
        
        // Fetch both order data and cancellation requests
        const [orderData, requestsData] = await Promise.all([
          getOrderById(id),
          getCancellationRequestsByOrderId(id)
        ]);
        
        if (orderData) {
          console.log("Order data received:", orderData);
          setOrder(orderData);
          // Initialize tracking form values if they exist
          if (orderData.tracking_id) setTrackingId(orderData.tracking_id);
          if (orderData.tracking_url) setTrackingUrl(orderData.tracking_url);
          if (orderData.shipping_carrier) setShippingCarrier(orderData.shipping_carrier);
          // Fetch customer profile
          if (orderData.user_id) {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('full_name, email, phone')
              .eq('id', orderData.user_id)
              .single();
            if (!error && profile) {
              setCustomerProfile(profile);
            }
          }
        } else {
          setError(`Order with ID ${id} not found`);
        }

        // Set cancellation requests
        setCancellationRequests(requestsData);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      if (updated) {
        setOrder({ ...order, status: newStatus });
        toast.success(`Order status updated to ${newStatus}`);
        
        // If status is changed to shipped, show the tracking form
        if (newStatus === 'shipped' && !order.tracking_id) {
          setShowTrackingForm(true);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };
  
  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    
    if (!trackingId.trim()) {
      toast.error('Tracking ID is required');
      return;
    }
    
    try {
      setUpdatingTracking(true);
      const updated = await updateOrderTracking(order.id, {
        tracking_id: trackingId.trim(),
        tracking_url: trackingUrl.trim(),
        shipping_carrier: shippingCarrier.trim()
      });
      
      if (updated) {
        setOrder({
          ...order,
          tracking_id: trackingId.trim(),
          tracking_url: trackingUrl.trim(),
          shipping_carrier: shippingCarrier.trim()
        });
        setShowTrackingForm(false);
        toast.success('Tracking information updated');
      }
    } catch (error) {
      console.error('Error updating tracking information:', error);
      toast.error('Failed to update tracking information');
    } finally {
      setUpdatingTracking(false);
    }
  };
  
  const handleDeleteOrder = async () => {
    if (!order) return;
    
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        const success = await deleteOrder(order.id);
        if (success) {
          toast.success('Order deleted successfully');
          navigate('/admin/orders');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };
  
  const handleRequestAction = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowResponseForm(true);
    setAdminResponse('');
    setApprovalStatus('approved');
  };
  
  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId) return;
    
    try {
      setProcessingResponse(true);
      await updateCancellationRequest(
        selectedRequestId,
        approvalStatus,
        adminResponse
      );
      
      // Refresh cancellation requests
      const updatedRequests = await getCancellationRequestsByOrderId(id!);
      setCancellationRequests(updatedRequests);
      
      // If approved a cancellation request, refresh order to get updated status
      if (approvalStatus === 'approved') {
        const updatedOrder = await getOrderById(id!);
        if (updatedOrder) {
          setOrder(updatedOrder);
        }
      }
      
      toast.success(`Request ${approvalStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowResponseForm(false);
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    } finally {
      setProcessingResponse(false);
    }
  };
  
  const getStatusStep = (status: OrderStatus): number => {
    const steps: Record<OrderStatus, number> = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    return steps[status];
  };
  
  const printOrder = () => {
    window.print();
  };

  const generateInvoicePDF = () => {
    alert('Download Invoice button clicked');
    console.log('generateInvoicePDF called', { order, customerProfile });
    try {
      if (!order) throw new Error('Order not loaded');
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('Invoice', 14, 20);
      doc.setFontSize(12);
      doc.text(`Order ID: ${order.id}`, 14, 35);
      doc.text(`Date: ${new Date(order.created_at).toLocaleString()}`, 14, 45);
      doc.text(`Customer: ${customerProfile?.full_name || ''}`, 14, 55);
      doc.text(`Email: ${customerProfile?.email || ''}`, 14, 65);
      doc.text(`Phone: ${customerProfile?.phone || ''}`, 14, 75);
      doc.text('Shipping Address:', 14, 85);
      const address = order.shipping_address;
      doc.text(`${address.full_name}, ${address.street}, ${address.city}, ${address.state}, ${address.postal_code}, ${address.country}`, 14, 95, { maxWidth: 180 });
      doc.text('Order Status: ' + order.status, 14, 110);
      // Add products table header
      let y = 120;
      doc.text('Products:', 14, y);
      y += 10;
      doc.setFontSize(10);
      doc.text('Name', 14, y);
      doc.text('Qty', 80, y);
      doc.text('Price', 120, y);
      doc.text('Total', 160, y);
      y += 7;
      let subtotal = 0;
      order.items?.forEach((item: any) => {
        const name = item.product?.name || '';
        const qty = item.quantity;
        const price = item.price;
        const total = price * qty;
        subtotal += total;
        doc.text(String(name), 14, y);
        doc.text(String(qty), 80, y);
        doc.text(String(price), 120, y);
        doc.text(String(total), 160, y);
        y += 7;
      });
      y += 5;
      doc.setFontSize(12);
      doc.text(`Subtotal: ₹${subtotal}`, 120, y);
      y += 7;
      const shippingFee = typeof order.payment_details?.shipping_fee === 'number' ? order.payment_details.shipping_fee : 0;
      doc.text(`Shipping: ₹${shippingFee}`, 120, y);
      y += 7;
      doc.text(`Total: ₹${order.total || 0}`, 120, y);
      doc.save(`invoice_${order.id}.pdf`);
    } catch (err: any) {
      alert('Error generating invoice: ' + err.message);
      console.error('Error in generateInvoicePDF', err);
    }
  };

  // Function to render image previews from image links in request reason
  const renderImagePreviews = (reason: string) => {
    // Extract image URLs from text
    const regex = /Images:\s*(https?:\/\/[^,\s]+(?:,\s*https?:\/\/[^,\s]+)*)/;
    const match = reason.match(regex);
    
    if (!match || !match[1]) return null;
    
    const imageUrls = match[1].split(',').map(url => url.trim());
    
    return (
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Images:</h5>
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative">
              <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                <img 
                  src={url} 
                  alt={`Image ${index + 1}`} 
                  className="h-24 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Error';
                  }}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
          {error || "Order not found"}
        </h3>
        <p className="text-gray-600 dark:text-soft-gray mb-6">
          We couldn't find the order you're looking for.
        </p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="btn-primary"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/orders')}
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-navy transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Details
          </h1>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={printOrder}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60 transition"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={generateInvoicePDF}
            className="flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Download Invoice
          </button>
          <button
            onClick={handleDeleteOrder}
            className="flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>
      
      {/* Order Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order ID and Date */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order #{order.id.substring(0, 8)}...
                </h2>
                <p className="text-gray-600 dark:text-soft-gray">
                  <CalendarRange className="inline w-4 h-4 mr-1" />
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {/* Status Badge */}
              <div className="flex flex-col items-end">
                <div className="mb-2">
                  {order.status === 'pending' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </span>
                  )}
                  {order.status === 'processing' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Package className="w-3 h-3 mr-1" />
                      Processing
                    </span>
                  )}
                  {order.status === 'shipped' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      <TruckIcon className="w-3 h-3 mr-1" />
                      Shipped
                    </span>
                  )}
                  {order.status === 'delivered' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Delivered
                    </span>
                  )}
                  {order.status === 'cancelled' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      <XCircle className="w-3 h-3 mr-1" />
                      Cancelled
                    </span>
                  )}
                </div>
                
                {/* Status update dropdown */}
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                  className="text-sm bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {/* Order Progress Timeline - Not visible when cancelled */}
            {order.status !== 'cancelled' && (
              <div className="mt-8">
                <div className="relative">
                  {/* Timeline Track */}
                  <div className="absolute inset-0 flex items-center justify-between">
                    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  
                  {/* Timeline Steps */}
                  <div className="relative flex justify-between items-center">
                    {/* Step 1: Pending */}
                    <div className={`flex flex-col items-center text-center ${
                      getStatusStep(order.status) >= 0 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getStatusStep(order.status) >= 0 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="mt-2 text-xs font-medium">Pending</span>
                    </div>
                    
                    {/* Step 2: Processing */}
                    <div className={`flex flex-col items-center text-center ${
                      getStatusStep(order.status) >= 1 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getStatusStep(order.status) >= 1 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="mt-2 text-xs font-medium">Processing</span>
                    </div>
                    
                    {/* Step 3: Shipped */}
                    <div className={`flex flex-col items-center text-center ${
                      getStatusStep(order.status) >= 2 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getStatusStep(order.status) >= 2 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <TruckIcon className="w-4 h-4" />
                      </div>
                      <span className="mt-2 text-xs font-medium">Shipped</span>
                    </div>
                    
                    {/* Step 4: Delivered */}
                    <div className={`flex flex-col items-center text-center ${
                      getStatusStep(order.status) >= 3 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getStatusStep(order.status) >= 3 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="mt-2 text-xs font-medium">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Cancellation/Replacement Requests */}
          {cancellationRequests.length > 0 && (
            <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-orange-500" />
                Customer Requests
              </h3>
              
              <div className="space-y-4">
                {cancellationRequests.map((request) => (
                  <div key={request.id} className={`border rounded-lg p-4 ${
                    request.status === 'pending' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800' :
                    request.status === 'approved' ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800' :
                    'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                        {request.type === 'cancel' ? 'Cancellation Request' : 'Replacement Request'}
                        {request.status === 'pending' && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                            Pending
                          </span>
                        )}
                        {request.status === 'approved' && (
                          <span className="ml-2 px-2 py-0.5 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                            Approved
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="ml-2 px-2 py-0.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs rounded-full">
                            Rejected
                          </span>
                        )}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 dark:text-soft-gray">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </p>
                    </div>
                    
                    {/* Display images if they exist in the reason text */}
                    {request.type === 'exchange' && renderImagePreviews(request.reason)}
                    
                    {request.admin_response && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-dark-navy rounded">
                        <p className="text-sm text-gray-700 dark:text-soft-gray">
                          <span className="font-medium">Admin Response:</span> {request.admin_response}
                        </p>
                      </div>
                    )}
                    
                    {request.status === 'pending' && (
                      <div className="mt-3 flex justify-end">
                        <button 
                          onClick={() => handleRequestAction(request.id)}
                          className="btn-primary text-sm py-1"
                        >
                          Respond to Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tracking Information Section - Only visible for shipped orders */}
          {order.status === 'shipped' && (
            <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <TruckIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Tracking Information
                </h3>
                
                {!showTrackingForm && (
                  <button 
                    onClick={() => setShowTrackingForm(true)}
                    className="text-neon-blue hover:text-blue-700 text-sm"
                  >
                    {order.tracking_id ? 'Edit Tracking' : 'Add Tracking'}
                  </button>
                )}
              </div>
              
              {showTrackingForm ? (
                <form onSubmit={handleUpdateTracking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Tracking ID/Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-navy"
                      placeholder="e.g. 1Z999AA10123456784"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Shipping Carrier
                    </label>
                    <select
                      value={shippingCarrier}
                      onChange={(e) => setShippingCarrier(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-navy"
                    >
                      <option value="">Select carrier</option>
                      <option value="DTDC">DTDC</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="Bluedart">Bluedart</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="India Post">India Post</option>
                      <option value="FedEx">FedEx</option>
                      <option value="DHL">DHL</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                      Tracking URL
                    </label>
                    <input
                      type="url"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-navy"
                      placeholder="https://example.com/track/1Z999AA10123456784"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Direct link where the customer can track this shipment
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTrackingForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingTracking || !trackingId.trim()}
                      className="btn-primary"
                    >
                      {updatingTracking ? (
                        <LoaderSpinner size="sm" />
                      ) : (
                        'Save Tracking Information'
                      )}
                    </button>
                  </div>
                </form>
              ) : order.tracking_id ? (
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-gray-600 dark:text-soft-gray w-28">Tracking ID:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {order.tracking_id}
                    </span>
                  </div>
                  {order.shipping_carrier && (
                    <div className="flex items-start">
                      <span className="text-gray-600 dark:text-soft-gray w-28">Carrier:</span>
                      <span className="text-gray-900 dark:text-white">
                        {order.shipping_carrier}
                      </span>
                    </div>
                  )}
                  {order.tracking_url && (
                    <div className="flex items-start">
                      <span className="text-gray-600 dark:text-soft-gray w-28">Track Online:</span>
                      <a 
                        href={order.tracking_url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:underline flex items-center"
                      >
                        Track Package <LinkIcon className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No tracking information has been added yet. Add tracking details to help the customer track their package.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Order Items */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Order Items ({order.items?.length || 0})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-navy">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {!order.items || order.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
                          <p className="font-medium">No items found for this order</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-dark-navy/60 transition-colors">
                        <td className="px-6 py-4 flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-dark-navy">
                            {item.product?.image && (
                              <img 
                                src={item.product.image} 
                                alt={item.product?.name} 
                                className="h-full w-full object-contain"
                              />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.product?.name || "Unknown Product"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {item.product_id.substring(0, 8)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                          ₹{Number(item.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                  
                  {/* Order Total */}
                  <tr className="bg-gray-50 dark:bg-dark-navy">
                    <td colSpan={3} className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Order Total:
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-neon-blue">
                      ₹{Number(order.total).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Right Column - Customer Information */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <User className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.shipping_address?.full_name || 'Name not provided'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-soft-gray mt-1">
                    User ID: {order.user_id.substring(0, 8)}...
                  </p>
                </div>
              </div>
              {order.shipping_address?.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-soft-gray">
                    {order.shipping_address.phone}
                  </p>
                </div>
              )}
              {/* Show email */}
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-soft-gray">
                  {order.email || customerProfile?.email || <span className="italic text-gray-400">No email provided</span>}
                </p>
              </div>
            </div>
          </div>
          
          {/* Shipping Info */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <TruckIcon className="w-5 h-5 mr-2" />
              Shipping Address
            </h3>
            
            {order.shipping_address ? (
              <div className="space-y-2 text-sm text-gray-600 dark:text-soft-gray">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shipping_address.full_name}
                </p>
                <p>{order.shipping_address.street}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No shipping address provided
              </p>
            )}
          </div>
          
          {/* Payment Info */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            
            {order.payment_details ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-soft-gray">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Method:</span> {order.payment_details.method || 'Card'}
                </p>
                {order.payment_details.card && (
                  <p className="text-sm text-gray-600 dark:text-soft-gray">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Card:</span> •••• {order.payment_details.card.last4}
                  </p>
                )}
                {order.payment_details.status && (
                  <p className="text-sm text-gray-600 dark:text-soft-gray">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span> {order.payment_details.status}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    No payment details available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Response Form Modal */}
      {showResponseForm && selectedRequestId && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Respond to Request
              </h3>
              
              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="approved"
                        checked={approvalStatus === 'approved'}
                        onChange={() => setApprovalStatus('approved')}
                        className="h-4 w-4 text-neon-blue focus:ring-neon-blue border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-soft-gray flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1 text-green-500" /> Approve
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="rejected"
                        checked={approvalStatus === 'rejected'}
                        onChange={() => setApprovalStatus('rejected')}
                        className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-soft-gray flex items-center">
                        <ThumbsDown className="w-4 h-4 mr-1 text-red-500" /> Reject
                      </span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-soft-gray mb-1">
                    Response Message
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-navy"
                    placeholder={approvalStatus === 'approved' 
                      ? 'Your request has been approved. Here are the next steps...'
                      : 'We regret to inform you that your request cannot be approved because...'
                    }
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResponseForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-50 dark:hover:bg-dark-navy/60 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingResponse}
                    className={approvalStatus === 'approved' ? 'btn-primary' : 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition'}
                  >
                    {processingResponse ? (
                      <LoaderSpinner size="sm" color={approvalStatus === 'approved' ? 'blue' : 'green'} />
                    ) : (
                      approvalStatus === 'approved' ? 'Approve Request' : 'Reject Request'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;