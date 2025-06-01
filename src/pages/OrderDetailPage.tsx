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
  Plus,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CancellationModal from '../components/order/CancellationModal';
import ReplacementModal from '../components/order/ReplacementModal';
import CancellationStatus from '../components/order/CancellationStatus';
import { createReview } from '../services/reviewService';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from '../components/order/InvoicePDF';

// Base64 encoded logo image - this is a placeholder for the Phytronix logo
const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF62lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyNC0wNS0yNVQxMDoxNTowMCswNTozMCIgeG1wOk1vZGlmeURhdGU9IjIwMjQtMDUtMjVUMTA6MTc6MjUrMDU6MzAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDUtMjVUMTA6MTc6MjUrMDU6MzAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZDQxODJhMDItNzMxNy01MDQz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';

// Function to wrap text in PDF
const wrapText = (doc: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const testWidth = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  lines.forEach((l, i) => doc.text(l.trim(), x, y + i * lineHeight));
  return lines.length * lineHeight;
};

// Helper function to truncate text if it's too long
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Format currency consistently
const formatCurrency = (amount: number) => {
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

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
  
  // Calculate shipping fee fallback logic (same as CheckoutPage)
  const FREE_SHIPPING_THRESHOLD = 1499;
  const SHIPPING_FEE = 99;
  const subtotal = order.items ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = typeof order.payment_details?.shipping_fee === 'number'
    ? order.payment_details.shipping_fee
    : (qualifiesForFreeShipping ? 0 : SHIPPING_FEE);
  
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
                      className="p-3 sm:p-4 md:p-6 mb-4 rounded-xl shadow-md bg-gray-50 dark:bg-dark-navy border border-gray-200 dark:border-gray-700 flex flex-row items-center gap-3 sm:flex-row sm:items-start sm:gap-6"
                    >
                      {/* Product Image */}
                      <div className="h-20 w-20 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-navy flex items-center justify-center">
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
                      <div className="flex-1 w-full flex flex-col gap-1 justify-center">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4 w-full">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center flex-wrap">
                              {item.product?.name || "Unknown Product"}
                              <Link to={`/product/${item.product_id}`} className="ml-1.5 text-neon-blue hover:text-blue-700 inline-flex items-center">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Quantity: {item.quantity}
                              </span>
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                                ₹{Number(item.price).toLocaleString()} each
                              </span>
                            </div>
                          </div>
                          <div className="text-left sm:text-right mt-2 sm:mt-0 w-full sm:w-auto">
                            <div className="text-lg font-bold text-neon-blue">
                              ₹{(Number(item.price) * item.quantity).toLocaleString()}
                            </div>
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => setReviewProduct(item.product_id)}
                                className="mt-2 inline-flex items-center text-xs sm:text-sm text-gray-600 hover:text-neon-blue dark:text-gray-300 dark:hover:text-neon-blue sm:whitespace-nowrap"
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
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {/* Order Summary */}
              <div className="p-6 bg-gray-50 dark:bg-dark-navy border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-soft-gray">Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-soft-gray">Shipping</span>
                  <span className="text-gray-900 dark:text-white font-medium">{shippingFee === 0 ? 'Free' : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-neon-blue">₹{(subtotal + shippingFee).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Customer and Shipping Info */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-neon-blue" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.shipping_address?.full_name || 'Name not provided'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-soft-gray">
                    {order.email || <span className="italic text-gray-400">No email provided</span>}
                  </span>
                </div>
                {order.shipping_address?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-soft-gray">
                      {order.shipping_address.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Shipping Address */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2 text-neon-blue" />
                Shipping Address
              </h3>
              {order.shipping_address ? (
                <div className="space-y-2 text-sm text-gray-600 dark:text-soft-gray">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {order.shipping_address.full_name}
                  </span>
                  <div>{order.shipping_address.street}</div>
                  <div>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                  </div>
                  <div>{order.shipping_address.country}</div>
                  {order.shipping_address.phone && <div>Phone: {order.shipping_address.phone}</div>}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No shipping address available
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
                
                {/* Download Invoice button - only show for delivered orders */}
                {order.status === 'delivered' ? (
                  <PDFDownloadLink 
                    document={<InvoicePDF order={order} />} 
                    fileName={`invoice_${order.id}.pdf`}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60 transition"
                  >
                    {({ blob, url, loading, error }) => 
                      loading ? 
                        <span>Preparing Invoice...</span> : 
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-2" />
                          Download Invoice
                        </div>
                    }
                  </PDFDownloadLink>
                ) : (
                  <div className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 cursor-not-allowed">
                    <Download className="w-4 h-4 mr-2" />
                    Invoice available after delivery
                  </div>
                )}
                
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