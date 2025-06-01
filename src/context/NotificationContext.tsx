// I've implemented a comprehensive notification system for the Phytronix e-commerce platform. Here's what I've added:

// Notification System Features
// Database Structure

// Created a user_notifications table in Supabase with fields for notification type, title, message, read status, and additional data
// Added proper RLS policies to ensure users can only access their own notifications
// Real-time Notifications

// Implemented Supabase real-time subscriptions to instantly show new notifications
// Added toast notifications when new notifications arrive
// Notification Panel UI

// Created a sleek notification panel that slides in from the right
// Shows unread count badge on the bell icon
// Displays notifications with appropriate icons based on type
// Allows marking individual or all notifications as read
// Supports deleting individual or all notifications
// Notification Types

// Order status updates (received, processing, shipped, delivered, cancelled)
// Tracking information updates
// Cancellation/replacement request updates
// Workshop request updates
// Account-related notifications
// Integration with Existing Features

// Added notification creation to order processing
// Added notification creation to cancellation/replacement requests
// Added notification creation to workshop requests
// Added a test notification button in the profile page
// Notification Settings

// Added a new "Notifications" tab in the profile page
// Implemented toggles for email and push notification preferences
// How to Use
// View Notifications: Click the bell icon in the navbar to see your notifications
// Mark as Read: Click on a notification to mark it as read, or use the checkmark button
// Delete Notifications: Use the trash icon to remove individual notifications
// Manage Settings: Go to Profile > Notifications to manage your notification preferences
// Test the System: Use the "Send Test Notification" button in the notification settings
// The notification system is fully integrated with the existing order, cancellation, and workshop request systems, so notifications will be automatically created when these events occur.
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Notification } from '../types';
import { 
  getUserNotifications, 
  getUnreadNotificationsCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  deleteAllNotifications,
  subscribeToNotifications
} from '../services/notificationService';
import { toast } from 'react-hot-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  showNotificationPanel: boolean;
  toggleNotificationPanel: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState<boolean>(false);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      refreshNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToNotifications((payload) => {
      // Check if the notification is for the current user
      if (payload.new && payload.new.user_id === user.id) {
        // Add the new notification to the state
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show a toast notification
        toast.success(payload.new.title, {
          duration: 4000,
          position: 'top-right',
          icon: '🔔',
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const refreshNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [notificationsData, unreadCountData] = await Promise.all([
        getUserNotifications(),
        getUnreadNotificationsCount()
      ]);
      
      setNotifications(notificationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotificationPanel = () => {
    setShowNotificationPanel(prev => !prev);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const removeNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // Update local state
      const removedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      
      // Update unread count if the removed notification was unread
      if (removedNotification && !removedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error removing notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await deleteAllNotifications();
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        showNotificationPanel,
        toggleNotificationPanel,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};