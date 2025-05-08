import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../services/orderService';
import { Order } from '../types';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Package, 
  TruckIcon, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  ExternalLink
} from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("Order ID is required");
          return;
        }
        
        const orderData = await getOrderById(id);
        if (orderData) {
          setOrder(orderData);
        } else {
          setError(`Order not found`);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        setCancelling(true);
        const success = await cancelOrder(order.id);
        if (success) {
          setOrder({ ...order, status: 'cancelled' });
          toast.success('Order cancelled successfully');
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
      } finally {
        setCancelling(false);
      }
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
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
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
          <div className="lg:col-span-2 bg-white dark:bg-light-navy rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Order Items</h3>
              <button className="text-neon-blue hover:text-blue-700 dark:hover:text-blue-400 flex items-center text-sm">
                <Download className="w-4 h-4 mr-1" />
                Invoice
              </button>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items?.map((item) => (
                <div key={item.id} className="p-4 flex items-start sm:items-center flex-col sm:flex-row sm:justify-between">
                  <div className="flex items-center flex-1">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-dark-navy">
                      {item.product?.image && (
                        <img 
                          src={item.product.image} 
                          alt={item.product?.name} 
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        {item.product?.name || "Unknown Product"}
                        <Link to={`/product/${item.product_id}`} className="ml-1 text-neon-blue hover:text-blue-700 inline-flex items-center">
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="text-right mt-3 sm:mt-0 w-full sm:w-auto">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{Number(item.price).toLocaleString()} per item
                    </div>
                    <div className="text-sm font-bold text-neon-blue mt-1">
                      ₹{(Number(item.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order Summary */}
            <div className="p-6 bg-gray-50 dark:bg-dark-navy">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-soft-gray">Subtotal</span>
                <span className="text-gray-900 dark:text-white">₹{Number(order.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-soft-gray">Shipping</span>
                <span className="text-gray-900 dark:text-white">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-neon-blue">₹{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Shipping Information</h3>
              
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
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Information</h3>
              
              {order.payment_details ? (
                <div>
                  <p className="text-sm text-gray-600 dark:text-soft-gray">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Method:</span> {order.payment_details.method || 'Card'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-soft-gray mt-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span> {order.payment_details.status || 'Paid'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-soft-gray mt-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span> {order.payment_details.date || new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Payment information not available
                </p>
              )}
            </div>
            
            {/* Actions */}
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Actions</h3>
              
              <div className="space-y-3">
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {cancelling ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                )}
                
                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy/60 transition">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
                
                <Link 
                  to="/contact"
                  className="w-full flex items-center justify-center px-4 py-2 border border-neon-blue rounded-lg text-neon-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  Get Help with Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;