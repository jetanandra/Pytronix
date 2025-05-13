import { supabase } from '../lib/supabaseClient';
import { Order, OrderStatus } from '../types';
import { toast } from 'react-hot-toast';

interface OrderDetails {
  user_id: string;
  total: number;
  shipping_address: any;
  payment_details: any;
  status?: string;
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
        product:products (
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
        product:products (
          id,
          name,
          price,
          discount_price,
          image,
          category_id,
          tags
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
    // Get the current session with access token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Authentication error:', sessionError || 'No active session');
      toast.error('Authentication required. Please login again.');
      throw new Error('Authentication required');
    }

    if (!session.access_token) {
      console.error('Missing access token in session');
      toast.error('Authentication token missing. Please login again.');
      throw new Error('Authentication token missing');
    }

    // Make the request to the Razorpay edge function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        orderId,
        amount: Math.round(amount) // Razorpay amount in rupees
      })
    });

    // Handle non-200 responses
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage;
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.details || `Request failed with status: ${response.status}`;
      } else {
        errorMessage = await response.text();
      }
      
      console.error('Razorpay error response:', errorMessage);
      throw new Error(`Failed to create Razorpay order: ${response.status} ${response.statusText}`);
    }

    // Parse and return the successful response
    return await response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    toast.error('Failed to create payment order. Please try again.');
    throw error;
  }
};

/**
 * Create an order in the database
 */
export const createOrder = async (orderDetails: OrderDetails, cartItems: any[] = []): Promise<{ id: string, order_id: string }> => {
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

    const orderId = data.id;
    
    // If cart items are provided, insert them into order_items table
    if (cartItems && cartItems.length > 0) {
      const orderItems = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.discount_price || item.product.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // We don't throw here to avoid canceling the entire order if only items fail
        toast.error('Order created but some items may not be recorded correctly');
      }
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
      .select(`
        *,
        items:order_items (
          id,
          product_id,
          quantity,
          price,
          product:products (
            id,
            name,
            image
          )
        )
      `)
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
export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
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