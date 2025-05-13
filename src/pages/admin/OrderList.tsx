import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { 
  ShoppingBag, 
  AlertTriangle, 
  ChevronDown, 
  CheckCircle, 
  Trash,
  TruckIcon, 
  Package, 
  XCircle, 
  Clock,
  Search,
  ExternalLink
} from 'lucide-react';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    processing: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      icon: <Package className="w-3 h-3 mr-1" />
    },
    shipped: {
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      icon: <TruckIcon className="w-3 h-3 mr-1" />
    },
    delivered: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      icon: <CheckCircle className="w-3 h-3 mr-1" />
    },
    cancelled: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      icon: <XCircle className="w-3 h-3 mr-1" />
    }
  };

  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getAllOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders when filters change
  useEffect(() => {
    let result = [...orders];
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by search query (order ID or shipping address)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) || 
        (order.shipping_address && 
          (
            order.shipping_address.full_name?.toLowerCase().includes(query) || 
            order.shipping_address.city?.toLowerCase().includes(query) ||
            order.shipping_address.postal_code?.toLowerCase().includes(query)
          )
        )
      );
    }
    
    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      if (updated) {
        // Update the orders list
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success(`Order status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await deleteOrder(orderId);
      if (success) {
        // Remove the order from the list
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        toast.success('Order deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
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
        Orders
      </h1>

      {/* Filters and Search */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            className="pl-10 w-full md:w-80 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-700 dark:text-soft-gray">Filter by:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Error Loading Orders
          </h3>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            No Orders Found
          </h3>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            {searchQuery || statusFilter !== 'all'
              ? "No orders match your search criteria. Try adjusting your filters."
              : "There are no orders in the system yet."}
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
        <div className="bg-white dark:bg-light-navy rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-navy">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-light-navy divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-dark-navy/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neon-blue">
                        <Link to={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.id.substring(0, 8)}...
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.shipping_address?.full_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.shipping_address?.city}, {order.shipping_address?.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <OrderStatusBadge status={order.status} />
                        
                        {/* Status dropdown for updating status */}
                        <div className="relative ml-2 group">
                          <button className="text-gray-500 hover:text-neon-blue dark:text-gray-400 dark:hover:text-neon-blue">
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-light-navy opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                            <button
                              onClick={() => handleStatusChange(order.id, 'pending')}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy"
                            >
                              Pending
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'processing')}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy"
                            >
                              Processing
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'shipped')}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy"
                            >
                              Shipped
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'delivered')}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy"
                            >
                              Delivered
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy"
                            >
                              Cancelled
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{Number(order.total).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {order.items && order.items.length > 0 ? (
                          <>
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div key={index} className="w-8 h-8 rounded-full border border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-800">
                                  {item.product?.image ? (
                                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package size={16} />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-gray-500 dark:text-gray-400 italic">No items</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-neon-blue hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;