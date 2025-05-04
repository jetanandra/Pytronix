import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, DollarSign, ArrowRight, AlertTriangle } from 'lucide-react';
import LoaderSpinner from '../../components/ui/LoaderSpinner';
import { getAllProducts } from '../../services/productService';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const products = await getAllProducts();
        
        // Calculate stats
        setStats({
          totalProducts: products.length,
          outOfStock: products.filter(p => p.stock <= 0).length,
          lowStock: products.filter(p => p.stock > 0 && p.stock <= 5).length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderSpinner size="lg" color="blue" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>
      
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
            <p className="text-gray-500 dark:text-gray-400 text-sm">Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6 flex items-center">
          <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-light-navy rounded-lg shadow p-6 flex items-center">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mr-4">
            <DollarSign className="w-6 h-6 text-neon-violet" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹0</p>
          </div>
        </div>
      </div>
      
      {/* Alerts */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alerts
        </h2>
        
        <div className="space-y-4">
          {stats.outOfStock > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 dark:text-red-300 font-medium">
                    Out of Stock Products
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                    You have {stats.outOfStock} products that are currently out of stock.
                  </p>
                  <Link to="/admin/products" className="inline-flex items-center text-sm text-red-600 dark:text-red-300 font-medium mt-2 hover:underline">
                    View Products <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {stats.lowStock > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-yellow-800 dark:text-yellow-300 font-medium">
                    Low Stock Products
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                    You have {stats.lowStock} products with low stock (5 or fewer items).
                  </p>
                  <Link to="/admin/products" className="inline-flex items-center text-sm text-yellow-600 dark:text-yellow-300 font-medium mt-2 hover:underline">
                    View Products <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {stats.outOfStock === 0 && stats.lowStock === 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-green-800 dark:text-green-300 font-medium">
                    All Systems Normal
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                    All products are in stock and inventory levels are healthy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/admin/products/new" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-4">
              <Package className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Add New Product</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create a new product listing</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/orders" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mr-4">
              <ShoppingBag className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Orders</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and process orders</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/users" 
            className="bg-white dark:bg-light-navy p-6 rounded-lg shadow hover:shadow-md transition flex items-center"
          >
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mr-4">
              <Users className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Manage Users</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and manage user accounts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;