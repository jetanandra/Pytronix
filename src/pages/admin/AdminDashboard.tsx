import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  ArrowRight, 
  AlertTriangle, 
  Clock, 
  TruckIcon, 
  CheckCircle, 
  XCircle, 
  BarChart2, 
  PieChart,
  RefreshCw,
  FileText,
  MessageSquare,
  Star,
  Calendar,
  Plus
} from 'lucide-react';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { getAllProducts } from '../../services/productService';
import { getAllOrders, getOrderStatusCounts, getMonthlyOrderStats } from '../../services/orderService';
import { getAllUsers } from '../../services/userService';
import { getAllCancellationRequests } from '../../services/cancellationService';
import { getAllReviews } from '../../services/reviewService';
import { getAllWorkshopRequests } from '../../services/workshopService';

// Chart component for order status
const OrderStatusChart = ({ data }) => {
  // Simple implementation of a pie chart using divs
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  return (
    <div className="relative pt-1">
      <div className="flex h-4 mb-4 overflow-hidden text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
        {Object.entries(data).map(([status, count]) => {
          if (count === 0) return null;
          const percentage = (count / total) * 100;
          let color;
          switch(status) {
            case 'pending': color = 'bg-yellow-500'; break;
            case 'processing': color = 'bg-blue-500'; break;
            case 'shipped': color = 'bg-purple-500'; break;
            case 'delivered': color = 'bg-green-500'; break;
            case 'cancelled': color = 'bg-red-500'; break;
            default: color = 'bg-gray-500';
          }
          return (
            <div 
              key={status}
              style={{ width: `${percentage}%` }}
              className={`${color} flex flex-col text-center whitespace-nowrap text-white justify-center`}
              title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
            ></div>
          );
        })}
      </div>
      <div className="flex justify-between">
        {Object.entries(data).map(([status, count]) => {
          if (count === 0) return null;
          let color;
          switch(status) {
            case 'pending': color = 'text-yellow-500'; break;
            case 'processing': color = 'text-blue-500'; break;
            case 'shipped': color = 'text-purple-500'; break;
            case 'delivered': color = 'text-green-500'; break;
            case 'cancelled': color = 'text-red-500'; break;
            default: color = 'text-gray-500';
          }
          return (
            <div key={status} className="text-xs">
              <span className={`font-medium ${color} capitalize`}>{status}</span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    ordersByStatus: {
      pending: 0,
      processing: 0, 
      shipped: 0,
      delivered: 0,
      cancelled: 0
    },
    alerts: {
      newOrders: 0,
      replacementRequests: 0,
      cancellationRequests: 0,
      workshopRequests: 0,
      unmoderatedReviews: 0
    }
  });
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    return currentMonth.toString();
  });
  
  const [monthlyStats, setMonthlyStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all required data in parallel
      const [
        products, 
        orders, 
        orderStatusCounts, 
        users, 
        cancellationRequests,
        reviews,
        workshopRequests,
        monthlyOrderData
      ] = await Promise.all([
        getAllProducts(),
        getAllOrders(),
        getOrderStatusCounts(),
        getAllUsers(),
        getAllCancellationRequests(),
        getAllReviews(),
        getAllWorkshopRequests(),
        getMonthlyOrderStats(parseInt(selectedMonth))
      ]);
      
      // Calculate total revenue from delivered orders
      const totalRevenue = orders.reduce((sum, order) => {
        // Only count completed/delivered orders in revenue
        if (order.status === 'delivered') {
          return sum + Number(order.total);
        }
        return sum;
      }, 0);
      
      // Calculate alerts
      const newOrders = orders.filter(o => o.status === 'pending').length;
      const pendingReplacements = cancellationRequests.filter(r => r.status === 'pending' && r.type === 'exchange').length;
      const pendingCancellations = cancellationRequests.filter(r => r.status === 'pending' && r.type === 'cancel').length;
      const pendingWorkshopRequests = workshopRequests.filter(w => w.status === 'pending').length;
      const unmoderatedReviews = reviews.filter(r => !r.moderated).length;
      
      // Calculate stats
      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalRevenue,
        ordersByStatus: orderStatusCounts,
        alerts: {
          newOrders,
          replacementRequests: pendingReplacements,
          cancellationRequests: pendingCancellations,
          workshopRequests: pendingWorkshopRequests,
          unmoderatedReviews
        }
      });
      
      // Set monthly stats
      setMonthlyStats(monthlyOrderData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const monthlyOrderData = await getMonthlyOrderStats(parseInt(selectedMonth));
        setMonthlyStats(monthlyOrderData);
      } catch (error) {
        console.error('Error fetching monthly data:', error);
      }
    };
    
    fetchMonthlyData();
  }, [selectedMonth]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };
  
  const handleQuickFilter = (month) => {
    setSelectedMonth(month.toString());
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <button 
          onClick={handleRefresh} 
          className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6 flex items-center">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
            <Package className="w-6 h-6 text-neon-blue" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6 flex items-center">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
            <ShoppingBag className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
            <div className="flex space-x-2 mt-1">
              <span className="text-xs text-yellow-500 dark:text-yellow-400">{stats.ordersByStatus.pending} pending</span>
              <span className="text-xs text-green-500 dark:text-green-400">{stats.ordersByStatus.delivered} completed</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6 flex items-center">
          <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6 flex items-center">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-4">
            <DollarSign className="w-6 h-6 text-neon-violet" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">From delivered orders</p>
          </div>
        </div>
      </div>
      
      {/* Order Status Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Status Analytics
            </h2>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMonth}
                onChange={handleMonthChange}
                className="bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-sm"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickFilter(5)} // June
              className={`px-3 py-1 text-xs rounded-full ${
                selectedMonth === '5' 
                  ? 'bg-neon-blue text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              June
            </button>
            <button
              onClick={() => handleQuickFilter(new Date().getMonth())}
              className={`px-3 py-1 text-xs rounded-full ${
                selectedMonth === new Date().getMonth().toString() 
                  ? 'bg-neon-blue text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Current Month
            </button>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-full">
              <OrderStatusChart data={monthlyStats} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-3 text-center">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{monthlyStats.pending}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-3 text-center">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Processing</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{monthlyStats.processing}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-3 text-center">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <TruckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Shipped</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{monthlyStats.shipped}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-3 text-center">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{monthlyStats.delivered}</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-navy rounded-lg p-3 text-center">
              <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cancelled</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{monthlyStats.cancelled}</p>
            </div>
          </div>
        </div>
        
        {/* Alert Center */}
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Alert Center
          </h2>
          
          <div className="space-y-4">
            {stats.alerts.newOrders > 0 && (
              <Link to="/admin/orders?filter=pending\" className="block">
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-red-800 dark:text-red-300 font-medium">
                        New Unprocessed Orders
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                        {stats.alerts.newOrders} new orders require processing
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {stats.alerts.replacementRequests > 0 && (
              <Link to="/admin/cancellations" className="block">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-yellow-800 dark:text-yellow-300 font-medium">
                        Pending Replacement Requests
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                        {stats.alerts.replacementRequests} replacement requests need review
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {stats.alerts.cancellationRequests > 0 && (
              <Link to="/admin/cancellations" className="block">
                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-orange-800 dark:text-orange-300 font-medium">
                        Pending Cancellation Requests
                      </h3>
                      <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                        {stats.alerts.cancellationRequests} cancellation requests need review
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {stats.alerts.workshopRequests > 0 && (
              <Link to="/admin/workshop-requests" className="block">
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-blue-800 dark:text-blue-300 font-medium">
                        New Workshop Requests
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                        {stats.alerts.workshopRequests} workshop booking requests pending
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {stats.alerts.unmoderatedReviews > 0 && (
              <Link to="/admin/reviews" className="block">
                <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-r-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-purple-800 dark:text-purple-300 font-medium">
                        Unmoderated Reviews
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-200 mt-1">
                        {stats.alerts.unmoderatedReviews} customer reviews need moderation
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {stats.alerts.newOrders === 0 && 
             stats.alerts.replacementRequests === 0 && 
             stats.alerts.cancellationRequests === 0 && 
             stats.alerts.workshopRequests === 0 && 
             stats.alerts.unmoderatedReviews === 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-green-800 dark:text-green-300 font-medium">
                      All Systems Normal
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                      No pending alerts or requests at this time.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Link 
            to="/admin/orders?filter=pending" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
              <ShoppingBag className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Process New Orders</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and process pending orders</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/cancellations" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mr-4">
              <RefreshCw className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Review Replacements</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Handle replacement requests</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/cancellations" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mr-4">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Handle Cancellations</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review cancellation requests</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/workshop-requests" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Workshops</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Review workshop bookings</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/reviews" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-4">
              <Star className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Moderate Reviews</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer reviews</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/products/new" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mr-4">
              <Plus className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Add New Product</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create a new product listing</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/reports" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mr-4">
              <FileText className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Generate Reports</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create sales and inventory reports</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/messages" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mr-4">
              <MessageSquare className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Customer Messages</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and respond to inquiries</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;