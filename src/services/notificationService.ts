import { supabase } from '../lib/supabaseClient';
import { Notification, NotificationType } from '../types';
import { toast } from 'react-hot-toast';

/**
 * Get all notifications for the current user
 */
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    return [];
  }
};

/**
 * Get unread notifications count for the current user
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread notifications count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getUnreadNotificationsCount:', error);
    return 0;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    throw error;
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all notifications

    if (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteAllNotifications:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time notifications
 */
export const subscribeToNotifications = (callback: (payload: any) => void) => {
  return supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'user_notifications' },
      callback
    )
    .subscribe();
};

/**
 * Get notification icon based on type
 */
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'order_received':
      return 'ShoppingBag';
    case 'order_processing':
      return 'Package';
    case 'order_shipped':
      return 'Truck';
    case 'order_delivered':
      return 'CheckCircle';
    case 'order_cancelled':
      return 'XCircle';
    case 'tracking_updated':
      return 'MapPin';
    case 'cancellation_approved':
    case 'cancellation_rejected':
      return 'FileX';
    case 'replacement_approved':
    case 'replacement_rejected':
      return 'RefreshCw';
    case 'workshop_request_submitted':
    case 'workshop_request_approved':
    case 'workshop_request_rejected':
      return 'Calendar';
    case 'password_changed':
      return 'Lock';
    case 'account_updated':
      return 'User';
    case 'system':
    default:
      return 'Bell';
  }
};

/**
 * Get notification color based on type
 */
export const getNotificationColor = (type: NotificationType): string => {
  switch (type) {
    case 'order_received':
      return 'blue';
    case 'order_processing':
      return 'purple';
    case 'order_shipped':
      return 'indigo';
    case 'order_delivered':
      return 'green';
    case 'order_cancelled':
      return 'red';
    case 'tracking_updated':
      return 'blue';
    case 'cancellation_approved':
      return 'green';
    case 'cancellation_rejected':
      return 'red';
    case 'replacement_approved':
      return 'green';
    case 'replacement_rejected':
      return 'red';
    case 'workshop_request_submitted':
      return 'blue';
    case 'workshop_request_approved':
      return 'green';
    case 'workshop_request_rejected':
      return 'red';
    case 'password_changed':
      return 'yellow';
    case 'account_updated':
      return 'blue';
    case 'system':
    default:
      return 'gray';
  }
};

/**
 * Create a test notification (for development purposes)
 */
export const createTestNotification = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in to create a test notification');
      return;
    }
    
    const { error } = await supabase
      .from('user_notifications')
      .insert([
        {
          user_id: user.id,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification created at ' + new Date().toLocaleTimeString(),
          data: { test: true }
        }
      ]);

    if (error) {
      console.error('Error creating test notification:', error);
      toast.error('Failed to create test notification');
      throw error;
    }
    
    toast.success('Test notification created');
  } catch (error) {
    console.error('Error in createTestNotification:', error);
    toast.error('Failed to create test notification');
  }
};