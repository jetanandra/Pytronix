import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  FileX, 
  RefreshCw, 
  Calendar, 
  Lock, 
  User, 
  Info,
  CheckCheck
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Notification, NotificationType } from '../../types';
import LoaderSpinner from './LoaderSpinner';

const NotificationPanel: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    showNotificationPanel, 
    toggleNotificationPanel,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();
  
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && showNotificationPanel) {
        toggleNotificationPanel();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationPanel, toggleNotificationPanel]);
  
  // Prevent scrolling of the body when panel is open
  useEffect(() => {
    if (showNotificationPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showNotificationPanel]);
  
  // Get icon component based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_received':
        return <ShoppingBag className="w-5 h-5 text-blue-500" />;
      case 'order_processing':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'order_shipped':
        return <Truck className="w-5 h-5 text-indigo-500" />;
      case 'order_delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'order_cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'tracking_updated':
        return <MapPin className="w-5 h-5 text-blue-500" />;
      case 'cancellation_approved':
        return <FileX className="w-5 h-5 text-green-500" />;
      case 'cancellation_rejected':
        return <FileX className="w-5 h-5 text-red-500" />;
      case 'replacement_approved':
        return <RefreshCw className="w-5 h-5 text-green-500" />;
      case 'replacement_rejected':
        return <RefreshCw className="w-5 h-5 text-red-500" />;
      case 'workshop_request_submitted':
      case 'workshop_request_approved':
      case 'workshop_request_rejected':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'password_changed':
        return <Lock className="w-5 h-5 text-yellow-500" />;
      case 'account_updated':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'system':
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Format relative time
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    }
    return 'Just now';
  };
  
  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type and data
    if (notification.data) {
      if (notification.type.startsWith('order_') && notification.data.order_id) {
        window.location.href = `/orders/${notification.data.order_id}`;
      } else if (notification.type.includes('workshop_') && notification.data.workshop_id) {
        window.location.href = `/workshop/${notification.data.workshop_id}`;
      }
    }
  };
  
  // Only render the notification bell in Navbar, not the panel
  if (!showNotificationPanel) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {showNotificationPanel && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={toggleNotificationPanel}
          />
          
          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-light-navy shadow-2xl z-[70] flex flex-col overflow-hidden"
            style={{
              boxShadow: '0 0 25px rgba(0, 0, 0, 0.15), 0 0 10px rgba(59, 130, 246, 0.1)'
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                  <Bell className="w-4 h-4 text-neon-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-sm text-neon-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full flex items-center transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={toggleNotificationPanel}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-navy rounded-full transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-navy">
              <button
                onClick={clearAllNotifications}
                className="flex-1 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center"
                disabled={notifications.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Clear All
              </button>
              <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
              <button
                onClick={markAllAsRead}
                className="flex-1 py-2 text-sm text-neon-blue hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center"
                disabled={unreadCount === 0}
              >
                <Check className="w-4 h-4 mr-1.5" />
                Mark All as Read
              </button>
            </div>
            
            {/* Notification List */}
            <div className="flex-grow overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <LoaderSpinner size="md\" color="blue" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                    We'll notify you when something important happens with your orders, workshops, or account
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-navy transition-colors relative ${
                        !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <div 
                        className="flex cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mr-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            !notification.is_read 
                              ? 'bg-blue-100 dark:bg-blue-900/30' 
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-grow pr-8">
                          <div className="flex justify-between items-start">
                            <h3 className={`text-sm font-medium ${
                              !notification.is_read 
                                ? 'text-gray-900 dark:text-white' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {notification.title}
                              {!notification.is_read && (
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                              )}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {getRelativeTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="absolute right-2 top-2 flex space-x-1">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;