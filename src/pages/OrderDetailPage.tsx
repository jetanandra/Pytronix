import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../services/orderService';
import { getCancellationRequestsByOrderId } from '../services/cancellationService';
import { Order, OrderCancellationRequest } from '../types';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Package, 
  TruckIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  ExternalLink,
  LinkIcon,
  AlertTriangle,
  Mail,
  Gift,
  Box,
  Star,
  File,
  Shield,
  Zap,
  MessageSquare,
  Plus
} from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CancellationModal from '../components/order/CancellationModal';
import ReplacementModal from '../components/order/ReplacementModal';
import CancellationStatus from '../components/order/CancellationStatus';
import { createReview } from '../services/reviewService';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [reviewProduct, setReviewProduct] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [showCancellationModal, setShowCancellationModal] = useState<boolean>(false);
  const [showReplacementModal, setShowReplacementModal] = useState<boolean>(false);
  const [cancellationRequests, setCancellationRequests] = useState<OrderCancellationRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);
  const orderItemsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("Order ID is required");
          return;
        }
        
        // Fetch order and cancellation requests in parallel
        const [orderData, requestsData] = await Promise.all([
          getOrderById(id),
          getCancellationRequestsByOrderId(id)
        ]);
        
        if (orderData) {
          console.log("Order data received:", orderData);
          setOrder(orderData);
        } else {
          setError(`Order not found`);
        }
        
        setCancellationRequests(requestsData);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
        setLoadingRequests(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const refreshRequests = async () => {
    if (!id) return;
    
    try {
      setLoadingRequests(true);
      const requestsData = await getCancellationRequestsByOrderId(id);
      setCancellationRequests(requestsData);
    } catch (error) {
      console.error('Error refreshing cancellation requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };
  
  const handleCancelOrder = async () => {
    if (!order) return;
    
    setShowCancellationModal(true);
  };
  
  const handleRequestReplacement = () => {
    if (!order) return;
    
    setShowReplacementModal(true);
  };

  const submitReview = async (productId: string) => {
    try {
      await createReview({
        product_id: productId,
        rating: reviewRating,
        title: '',
        content: reviewText,
        is_verified_purchase: true,
        user_id: '' // This will be set by the service
      });
      
      toast.success('Thank you for your review!');
      setReviewProduct(null);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };
  
  const getStatusStep = (status: string): number => {
    const steps: Record<string, number> = {
      'pending': 0,
      'processing': 1,
      'shipped': 2,
      'delivered': 3,
      'cancelled': -1
    };
    return steps[status] || 0;
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'shipped':
        return 'text-purple-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Check if user has any pending requests
  const hasPendingRequest = cancellationRequests.some(request => request.status === 'pending');
  
  // Check if user can cancel order (only pending or processing orders)
  const canCancelOrder = order && ['pending', 'processing'].includes(order.status);
  
  // Check if user can request replacement (only delivered orders)
  const canRequestReplacement = order && order.status === 'delivered';
  
  // Handler for the main review button
  const handleMainReviewClick = () => {
    if (order && order.items && order.items.length > 0) {
      setReviewProduct(order.items[0].product_id);
      setTimeout(() => {
        orderItemsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // Wait for state update
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="min-h-screen pt-32 pb-12">
        <div className="container-custom">
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 text-center max-w-lg mx-auto">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {error || "Order Not Found"}
            </h2>
            <p className="text-gray-600 dark:text-soft-gray mb-6">
              We couldn't find the order you're looking for. It may have been removed or the ID is incorrect.
            </p>
            <button
              onClick={() => navigate('/orders')}
              className="btn-primary"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Get the expected delivery date
  const getExpectedDeliveryDate = () => {
    const date = new Date(order.created_at);
    date.setDate(date.getDate() + 7); // Add 7 days for delivery estimate
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get timestamps for different order stages (simplified for demo)
  const orderPlacedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const processingDate = order.status !== 'pending' ? 
    new Date(new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : null;
  
  const shippedDate = order.status === 'shipped' || order.status === 'delivered' ?
    new Date(new Date(order.created_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : null;
    
  const deliveredDate = order.status === 'delivered' ?
    new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : null;
  
  // Order status message component
  const OrderStatusMessage = () => {
    if (order.status === 'cancelled') {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">Order Cancelled</h3>
              <p className="text-red-700 dark:text-red-200">
                This order has been cancelled and will not be processed. If you have any questions, 
                please contact our customer support.
              </p>
              <div className="mt-4">
                <Link to="/products" className="btn-primary">
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (order.status === 'pending') {
      return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0 relative">
              <Clock className="w-8 h-8 text-yellow-500" />
              <motion.div
                className="absolute inset-0 rounded-full border border-yellow-300"
                animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Order Received Successfully!</h3>
              <p className="text-yellow-700 dark:text-yellow-200 mb-2">
                Thank you for your order. We've received it and will begin processing soon.
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center text-yellow-600 dark:text-yellow-300 text-sm">
                  <Gift className="w-4 h-4 mr-1" />
                  <span>Order placed on {orderPlacedDate}</span>
                </div>
                <div className="flex items-center text-yellow-600 dark:text-yellow-300 text-sm">
                  <Box className="w-4 h-4 mr-1" />
                  <span>Order will be processed within 24 hours</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-yellow-700 dark:text-yellow-200">
                <strong>Note:</strong> You will receive an email update when your order is processed.
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (order.status === 'processing') {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 relative">
              <Package className="w-8 h-8 text-blue-500" />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ 
                  boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 0 8px rgba(59, 130, 246, 0.2)', '0 0 0 0 rgba(59, 130, 246, 0)'] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-1">Your Order is Being Processed</h3>
              <p className="text-blue-700 dark:text-blue-200 mb-2">
                We're preparing your items for shipment. Your order will be shipped soon!
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center text-blue-600 dark:text-blue-300 text-sm">
                  <Package className="w-4 h-4 mr-1" />
                  <span>Processing started on {processingDate}</span>
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-300 text-sm">
                  <TruckIcon className="w-4 h-4 mr-1" />
                  <span>Expected to ship in 1-2 days</span>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-700 dark:text-blue-200">
                <strong>Note:</strong> You will receive an email with tracking information once your order ships.
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (order.status === 'shipped') {
      return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 relative">
              <TruckIcon className="w-8 h-8 text-purple-500" />
              <motion.div
                className="absolute inset-0 rounded-full border border-purple-300"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-1">Your Order is On the Way!</h3>
              <p className="text-purple-700 dark:text-purple-200 mb-2">
                Your order has been shipped and is on its way to you.
              </p>
              
              {order.tracking_id ? (
                <div className="bg-white dark:bg-dark-navy rounded-lg p-4 mt-3">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
                      <Box className="w-4 h-4 mr-1" />
                      <span>Shipped on {shippedDate}</span>
                    </div>
                    <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
                      <LinkIcon className="w-4 h-4 mr-1" />
                      <span>Tracking ID: {order.tracking_id}</span>
                    </div>
                    {order.shipping_carrier && (
                      <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
                        <TruckIcon className="w-4 h-4 mr-1" />
                        <span>Carrier: {order.shipping_carrier}</span>
                      </div>
                    )}
                  </div>
                  
                  {order.tracking_url && (
                    <div className="mt-3">
                      <a 
                        href={order.tracking_url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex items-center"
                      >
                        <TruckIcon className="w-4 h-4 mr-2" />
                        Track Package
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
                    <TruckIcon className="w-4 h-4 mr-1" />
                    <span>Shipped on {shippedDate}</span>
                  </div>
                  <div className="flex items-center text-purple-600 dark:text-purple-300 text-sm">
                    <Zap className="w-4 h-4 mr-1" />
                    <span>Expected delivery by {getExpectedDeliveryDate()}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-purple-700 dark:text-purple-200">
                <strong>Note:</strong> Our delivery partner will contact you before delivery.
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (order.status === 'delivered') {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-900/50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 relative">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <motion.div
                className="absolute inset-0 rounded-full border border-green-300"
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">Order Successfully Delivered!</h3>
              <p className="text-green-700 dark:text-green-200 mb-2">
                Your order has been delivered. We hope you enjoy your purchase!
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center text-green-600 dark:text-green-300 text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Delivered on {deliveredDate}</span>
                </div>
                <div className="flex items-center text-green-600 dark:text-green-300 text-sm">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Warranty active</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-green-700 dark:text-green-200 mb-3">
                  <strong>How was your experience?</strong> Share your feedback by reviewing the products you purchased.
                </p>
                <button className="btn-primary" onClick={handleMainReviewClick}>
                  <Star className="w-4 h-4 mr-2" />
                  Review Your Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default case
    return null;
  };
  
  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/orders')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-navy transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                Order #{order.id.substring(0, 8)}...
              </h1>
              <p className="text-gray-600 dark:text-soft-gray text-sm md:text-base mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div className="hidden sm:block">
            {canCancelOrder && !hasPendingRequest && (
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
        
        {/* Order Progress - Not visible when cancelled */}
        {order.status !== 'cancelled' && (
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">Order Status</h2>
              <div className="flex items-center">
                {getStatusIcon(order.status)}
                <span className={`ml-2 font-medium ${getStatusClass(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center justify-between" style={{ top: '2rem' }}>
                <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              
              <div className="relative flex justify-between items-center">
                {/* Step 1: Pending */}
                <div className={`flex flex-col items-center text-xs ${
                  getStatusStep(order.status) >= 0 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                    getStatusStep(order.status) >= 0 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="mt-2">Pending</span>
                </div>
                
                {/* Step 2: Processing */}
                <div className={`flex flex-col items-center text-xs ${
                  getStatusStep(order.status) >= 1 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                    getStatusStep(order.status) >= 1 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="mt-2">Processing</span>
                </div>
                
                {/* Step 3: Shipped */}
                <div className={`flex flex-col items-center text-xs ${
                  getStatusStep(order.status) >= 2 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                    getStatusStep(order.status) >= 2 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <TruckIcon className="w-4 h-4" />
                  </div>
                  <span className="mt-2">Shipped</span>
                </div>
                
                {/* Step 4: Delivered */}
                <div className={`flex flex-col items-center text-xs ${
                  getStatusStep(order.status) >= 3 ? 'text-neon-blue' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                    getStatusStep(order.status) >= 3 ? 'bg-neon-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="mt-2">Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Dynamic Order Status Message */}
        <OrderStatusMessage />
        
        {/* Cancellation Requests */}
        {!loadingRequests && cancellationRequests.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Request History
            </h3>
            <div className="space-y-4">
              {cancellationRequests.map(request => (
                <CancellationStatus key={request.id} request={request} />
              ))}
            </div>
          </div>
        )}
        
        {/* Cancelled Notice */}
        {order.status === 'cancelled' && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-8">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 dark:text-red-300 font-medium">
                  Order Cancelled
                </h3>
                <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                  This order has been cancelled and will not be processed.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2" ref={orderItemsRef}>
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2 text-neon-blue" /> 
                  Order Items
                </h3>
                <button className="text-neon-blue hover:text-blue-700 dark:hover:text-blue-400 flex items-center text-sm">
                  <Download className="w-4 h-4 mr-1" />
                  Invoice
                </button>
              </div>
              
              {!order.items || order.items.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    No Items Found
                  </h3>
                  <p className="text-gray-600 dark:text-soft-gray mb-4">
                    We couldn't find any items for this order. This could happen for orders placed before the latest system update.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 md:p-6"
                    >
                      <div className="flex flex-col md:flex-row items-start gap-4">
                        {/* Product Image */}
                        <div className="h-24 w-24 md:h-28 md:w-28 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-navy flex items-center justify-center">
                          {item.product?.image ? (
                            <img 
                              src={item.product.image} 
                              alt={item.product?.name} 
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <Package className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-4">
                            <div>
                              <div className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                                {item.product?.name || "Unknown Product"}
                                <Link to={`/product/${item.product_id}`} className="ml-1.5 text-neon-blue hover:text-blue-700 inline-flex items-center">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                              
                              <div className="mt-1 flex items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                  Quantity: {item.quantity}
                                </span>
                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                                  ₹{Number(item.price).toLocaleString()} each
                                </span>
                              </div>
                            </div>
                            
                            <div className="text-right mt-2 md:mt-0">
                              <div className="text-lg font-bold text-neon-blue">
                                ₹{(Number(item.price) * item.quantity).toLocaleString()}
                              </div>
                              
                              {order.status === 'delivered' && (
                                <button 
                                  onClick={() => setReviewProduct(item.product_id)}
                                  className="mt-2 inline-flex items-center text-sm text-gray-600 hover:text-neon-blue dark:text-gray-300 dark:hover:text-neon-blue"
                                >
                                  <Star className="w-3.5 h-3.5 mr-1" />
                                  Write a Review
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Product tags/details - if available */}
                          {item.product?.tags && item.product.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.product.tags.map((tag, idx) => (
                                <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Review Form */}
                      {reviewProduct === item.product_id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="bg-gray-50 dark:bg-dark-navy p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Write Your Review</h4>
                            <div className="mb-3">
                              <div className="flex items-center mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-300 mr-3">Rating:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewRating(star)}
                                      className={`p-1 ${star <= reviewRating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                                    >
                                      <Star className="w-5 h-5" fill={star <= reviewRating ? 'currentColor' : 'none'} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Share your experience with this product..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-navy text-gray-700 dark:text-gray-300"
                                rows={3}
                              ></textarea>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReviewProduct(null)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => submitReview(item.product_id)}
                                className="px-4 py-2 bg-neon-blue text-white rounded-lg text-sm hover:bg-blue-600"
                              >
                                Submit Review
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Order Summary */}
              <div className="p-6 bg-gray-50 dark:bg-dark-navy border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-soft-gray">Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{Number(order.total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-soft-gray">Shipping</span>
                  <span className="text-gray-900 dark:text-white font-medium">Free</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-neon-blue">₹{Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2 text-neon-blue" />
                Shipping Information
              </h3>
              
              {order.shipping_address ? (
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.shipping_address.full_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-soft-gray">
                    {order.shipping_address.street}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                    {order.shipping_address.country}
                  </p>
                  {order.shipping_address.phone && (
                    <p className="text-sm text-gray-600 dark:text-soft-gray">
                      Phone: {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No shipping information available
                </p>
              )}
            </div>
            
            {/* Payment Information */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <File className="w-5 h-5 mr-2 text-neon-blue" />
                Payment Information
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-soft-gray">Method:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.payment_details?.method === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-soft-gray">Status:</span>
                  <span className="text-sm font-medium">
                    {order.status === 'cancelled' ? (
                      <span className="text-red-600 dark:text-red-400">Cancelled</span>
                    ) : order.payment_details?.status === 'paid' ? (
                      <span className="text-green-600 dark:text-green-400">Paid</span>
                    ) : order.payment_details?.method === 'cod' ? (
                      <span className="text-yellow-600 dark:text-yellow-400">Pay on Delivery</span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-soft-gray">Date:</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-neon-blue" />
                Order Actions
              </h3>
              
              <div className="space-y-3">
                {canCancelOrder && !hasPendingRequest && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                
                {canRequestReplacement && !hasPendingRequest && (
                  <button
                    onClick={handleRequestReplacement}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-orange-300 dark:border-orange-700 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Request Replacement
                  </button>
                )}
                
                {hasPendingRequest && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 rounded-r mb-2">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      You have a pending request for this order. Please wait for our team to process it.
                    </p>
                  </div>
                )}
                
                <button className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60 transition">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
                
                <Link 
                  to="/contact"
                  className="w-full flex items-center justify-center px-4 py-2.5 border border-neon-blue rounded-lg text-neon-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <AnimatePresence>
        {showCancellationModal && (
          <CancellationModal 
            orderId={order.id} 
            onClose={() => setShowCancellationModal(false)} 
            onSubmit={() => {
              setShowCancellationModal(false);
              refreshRequests();
            }} 
          />
        )}
      </AnimatePresence>

      {/* Replacement Modal */}
      <AnimatePresence>
        {showReplacementModal && (
          <ReplacementModal 
            orderId={order.id} 
            onClose={() => setShowReplacementModal(false)} 
            onSubmit={() => {
              setShowReplacementModal(false);
              refreshRequests();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetailPage;