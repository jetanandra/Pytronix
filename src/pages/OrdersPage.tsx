import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../services/orderService';
import { Order } from '../types';
import { 
  ShoppingBag, 
  Clock, 
  Package, 
  TruckIcon, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ChevronRight,
  CalendarDays,
  ExternalLink,
  ShoppingCart
} from 'lucide-react';
import LoaderSpinner from '../components/ui/LoaderSpinner';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getUserOrders();
        console.log("Fetched orders:", data);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white flex items-center">
          <ShoppingBag className="w-8 h-8 mr-3 text-neon-blue" /> Your Orders
        </h1>
        
        {error ? (
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Error Loading Orders
            </h2>
            <p className="text-gray-600 dark:text-soft-gray mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center justify-center"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-lg p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No Orders Yet
            </h2>
            <p className="text-gray-600 dark:text-soft-gray mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              to="/products"
              className="btn-primary inline-flex items-center justify-center"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="bg-white dark:bg-light-navy rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col md:flex-row items-start md:items-center gap-6 relative block"
              >
                {/* Order Status Icon */}
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                  order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30' :
                  order.status === 'shipped' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  {getStatusIcon(order.status)}
                </div>
                
                {/* Order Details */}
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order #{order.id.substring(0, 8)}...
                    </div>
                    <div className="flex items-center">
                      <CalendarDays className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-soft-gray">
                        Placed on {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full">
                    <div className="flex-grow">
                      <div className="text-sm text-gray-600 dark:text-soft-gray mb-2">
                        Items: <span className="font-medium">{order.items?.length || 'N/A'}</span>
                      </div>
                      
                      {/* Order Items Preview - Show first 2-3 items */}
                      {order.items && order.items.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center bg-gray-50 dark:bg-dark-navy rounded-md p-1">
                              {item.product?.image && (
                                <img 
                                  src={item.product.image} 
                                  alt={item.product?.name || ''} 
                                  className="w-8 h-8 object-contain rounded-sm mr-2"
                                />
                              )}
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                {item.quantity}x
                              </span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex items-center justify-center bg-gray-50 dark:bg-dark-navy rounded-md p-1 w-8 h-8">
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                +{order.items.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Items data may be missing for this order
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-600 dark:text-soft-gray">
                        Total: <span className="font-medium text-gray-900 dark:text-white">₹{Number(order.total).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      
                      <ChevronRight className="w-5 h-5 ml-2 text-gray-400 md:block hidden" />
                    </div>
                  </div>
                </div>
                
                {/* Absolute positioned icon for visual indication this is a link */}
                <div className="absolute top-4 right-4 text-gray-400 dark:text-gray-600 md:hidden">
                  <ExternalLink className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;