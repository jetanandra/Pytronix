import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart, 
  PieChart,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Download,
  Plus
} from 'lucide-react';
import { emailQueue } from '../../services/emailService';
import LoaderSpinner from '../ui/LoaderSpinner';
import EmailTemplateManager from './EmailTemplateManager';

// Mock data for email analytics
const mockEmailStats = {
  totalSent: 1248,
  delivered: 1235,
  opened: 876,
  clicked: 432,
  bounced: 13,
  deliveryRate: 98.9,
  openRate: 70.9,
  clickRate: 34.6,
  byType: [
    { type: 'Order Confirmation', count: 342, openRate: 82.5 },
    { type: 'Shipping Update', count: 298, openRate: 78.2 },
    { type: 'Delivery Confirmation', count: 276, openRate: 75.4 },
    { type: 'Payment Confirmation', count: 187, openRate: 68.9 },
    { type: 'Abandoned Cart', count: 145, openRate: 52.3 }
  ],
  recentEmails: [
    { id: '1', type: 'Order Confirmation', recipient: 'john.doe@example.com', status: 'delivered', sentAt: '2025-05-30T10:23:45Z' },
    { id: '2', type: 'Shipping Update', recipient: 'jane.smith@example.com', status: 'opened', sentAt: '2025-05-30T09:15:22Z' },
    { id: '3', type: 'Payment Confirmation', recipient: 'robert.johnson@example.com', status: 'clicked', sentAt: '2025-05-30T08:47:10Z' },
    { id: '4', type: 'Abandoned Cart', recipient: 'sarah.williams@example.com', status: 'delivered', sentAt: '2025-05-30T07:32:18Z' },
    { id: '5', type: 'Delivery Confirmation', recipient: 'michael.brown@example.com', status: 'bounced', sentAt: '2025-05-30T06:19:55Z' }
  ]
};

const EmailDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState(mockEmailStats);
  const [showTemplateManager, setShowTemplateManager] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<string>('last7days');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
    setLoading(true);
    
    // Simulate loading new data
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </span>
        );
      case 'opened':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Opened
          </span>
        );
      case 'clicked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Clicked
          </span>
        );
      case 'bounced':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Bounced
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Mail className="w-6 h-6 mr-2 text-neon-blue" />
          Email Notification System
        </h1>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowTemplateManager(true)}
            className="btn-secondary flex items-center"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Templates
          </button>
          
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 800);
            }}
            className="btn-primary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoaderSpinner size="lg" color="blue" />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={dateRange}
                    onChange={handleDateRangeChange}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                  >
                    <option value="all">All Statuses</option>
                    <option value="delivered">Delivered</option>
                    <option value="opened">Opened</option>
                    <option value="clicked">Clicked</option>
                    <option value="bounced">Bounced</option>
                  </select>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by email or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full md:w-64 px-4 py-2 bg-white dark:bg-dark-navy border border-gray-300 dark:border-gray-700 rounded-lg"
                />
              </div>
              
              <button className="btn-secondary flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-soft-white">Total Sent</h3>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5 text-neon-blue" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSent.toLocaleString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {dateRange === 'last7days' ? 'Last 7 days' : 'Last 30 days'}
              </p>
            </div>
            
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-soft-white">Delivery Rate</h3>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.deliveryRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats.delivered.toLocaleString()} delivered
              </p>
            </div>
            
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-soft-white">Open Rate</h3>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.openRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats.opened.toLocaleString()} opened
              </p>
            </div>
            
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-soft-white">Click Rate</h3>
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.clickRate}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stats.clicked.toLocaleString()} clicked
              </p>
            </div>
          </div>
          
          {/* Email Performance by Type */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white dark:bg-light-navy rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-2 text-neon-blue" />
                Email Performance by Type
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email Type
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sent
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Open Rate
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.byType.map((type, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {type.type}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600 dark:text-soft-gray">
                          {type.count}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-600 dark:text-soft-gray">
                          {type.openRate}%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-[150px]">
                              <div 
                                className="bg-neon-blue h-2.5 rounded-full" 
                                style={{ width: `${type.openRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-neon-blue" />
                Email Status Distribution
              </h3>
              
              <div className="flex justify-center items-center h-64">
                {/* This would be a chart in a real implementation */}
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.deliveryRate}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.openRate}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Opened</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.clickRate}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Clicked</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{(stats.bounced / stats.totalSent * 100).toFixed(1)}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Bounced</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Emails */}
          <div className="bg-white dark:bg-light-navy rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-neon-blue" />
                Recent Email Activity
              </h3>
              
              <button className="text-sm text-neon-blue hover:text-blue-700 dark:hover:text-blue-400 flex items-center">
                <Plus className="w-4 h-4 mr-1" />
                Send Manual Email
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-dark-navy/60">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {email.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-soft-gray">
                        {email.recipient}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {getStatusBadge(email.status)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600 dark:text-soft-gray">
                        {formatDate(email.sentAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <button className="text-sm text-neon-blue hover:text-blue-700 dark:hover:text-blue-400">
                View All Email Activity
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* Email Template Manager Modal */}
      {showTemplateManager && (
        <EmailTemplateManager onClose={() => setShowTemplateManager(false)} />
      )}
    </div>
  );
};

export default EmailDashboard;