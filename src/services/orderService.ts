import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface OrderDetails {
  user_id: string;
  total: number;
  shipping_address: any;
  payment_details: any;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

/**
 * Get all orders for the current user
 */
export const getUserOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product: product_id (
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
      order_items (
        *,
        product: product_id (
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
export const createRazorpayOrder = async (orderId: string, amount: number): Promise<RazorpayOrder> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        orderId,
        amount: Math.round(amount * 100) // Razorpay amount in paise
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Razorpay order: ${errorText}`);
    }

    const data = await response.json();
    
    // Update the order with Razorpay order ID
    await supabase
      .from('orders')
      .update({ razorpay_order_id: data.id })
      .eq('id', orderId);

    return data;
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

    const data = await response.json();
    
    // Update order with payment status and payment ID
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: razorpayPaymentId
      })
      .eq('id', orderId);

    return data;
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
    // Make sure user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }

    // Make sure user_id matches the authenticated user
    if (orderDetails.user_id !== session.user.id) {
      orderDetails.user_id = session.user.id;
    }

    // Insert the order
    const { data, error } = await supabase
      .from('orders')
      .insert([orderDetails])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
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
 * Get order history for the current user
 */
export const getOrderHistory = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getOrderHistory:', error);
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