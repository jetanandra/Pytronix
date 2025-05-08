import { supabase } from '../lib/supabaseClient';
import { Order, OrderStatus } from '../types';
import { toast } from 'react-hot-toast';

interface OrderDetails {
  user_id: string;
  total: number;
  shipping_address: any;
  payment_details: any;
}

/**
 * Get all orders for the current user
 */
export const getUserOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:product_id (
          id,
          name,
          price,
          discount_price,
          image
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data || [];
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (id: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:product_id (
          id,
          name,
          price,
          discount_price,
          image
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }

  return data;
};

/**
 * Create a Razorpay order
 */
export const createRazorpayOrder = async (orderId: string, amount: number) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No active session');
      throw new Error('Authentication required');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        orderId,
        amount: Math.round(amount) // Razorpay amount in rupees
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay error response:', errorText);
      throw new Error(`Failed to create Razorpay order: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    toast.error('Failed to create payment order');
    throw error;
  }
};

/**
 * Verify Razorpay payment
 */
export const verifyRazorpayPayment = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.error('No active session');
      throw new Error('Authentication required');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        orderId,
        razorpayOrderId,
        razorpayPaymentId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payment verification failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

/**
 * Create an order in the database
 */
export const createOrder = async (orderDetails: OrderDetails): Promise<{ id: string, order_id: string }> => {
  try {
    // Make sure we have the active session and get the correct user_id
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    // Always set user_id to the authenticated user to prevent RLS policy violations
    const safeOrderDetails = {
      ...orderDetails,
      user_id: session.user.id
    };

    // Insert the order
    const { data, error } = await supabase
      .from('orders')
      .insert([safeOrderDetails])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }

    // Generate a readable order ID (use first 8 chars of UUID)
    const order_id = data.id.substring(0, 8).toUpperCase();
    
    return {
      id: data.id,
      order_id
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Get all orders (admin function)
 */
export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
      
    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    throw error;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        payment_details: {
          status: 'cancelled'
        }
      })
      .eq('id', orderId);
      
    if (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    throw error;
  }
};

/**
 * Delete an order (admin only)
 */
export const deleteOrder = async (orderId: string) => {
  try {
    // Delete order items first
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
      
    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      throw itemsError;
    }
    
    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
      
    if (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    throw error;
  }
};

/**
 * Update order tracking information
 */
export const updateOrderTracking = async (
  orderId: string,
  trackingInfo: {
    tracking_id: string;
    tracking_url?: string;
    shipping_carrier?: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update(trackingInfo)
      .eq('id', orderId);
      
    if (error) {
      console.error('Error updating tracking info:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateOrderTracking:', error);
    throw error;
  }
};

/**
 * Get order count by status
 */
export const getOrderStatusCounts = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status');
      
    if (error) {
      console.error('Error fetching orders for counting:', error);
      throw error;
    }
    
    const counts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    data.forEach(order => {
      if (counts.hasOwnProperty(order.status)) {
        counts[order.status as keyof typeof counts]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error in getOrderStatusCounts:', error);
    return {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
  }
};