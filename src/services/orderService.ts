import { supabase } from '../lib/supabaseClient';
import { Order, OrderItem } from '../types';
import { toast } from 'react-hot-toast';
import { createRazorpayOrder } from './paymentService';

// Get all orders for admin
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
};

// Get user orders
export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

// Get order details by ID
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

// Create a new order
export const createOrder = async (
  shippingAddress: any, 
  paymentDetails: any = null
): Promise<Order | null> => {
  try {
    // Get cart from localStorage
    const cartJson = localStorage.getItem('pytronix-cart');
    if (!cartJson) {
      throw new Error('Cart is empty');
    }
    
    const cart = JSON.parse(cartJson);
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Begin transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        total: cart.total,
        shipping_address: shippingAddress,
        payment_details: paymentDetails
      }])
      .select()
      .single();
      
    if (orderError) throw orderError;
    
    // Insert order items
    const orderItems = cart.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.discount_price || item.product.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
      
    if (itemsError) throw itemsError;
    
    // If using Razorpay, create a Razorpay order
    if (paymentDetails.method === 'razorpay') {
      const razorpayOrder = await createRazorpayOrder(cart.total, order.id);
      
      if (!razorpayOrder) {
        throw new Error('Failed to create Razorpay order');
      }
      
      // Update the order with Razorpay details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_details: {
            ...paymentDetails,
            razorpay_order_id: razorpayOrder.id
          },
          razorpay_order_id: razorpayOrder.id
        })
        .eq('id', order.id);
        
      if (updateError) {
        console.error('Error updating order with Razorpay details:', updateError);
      }
      
      // Return the order with Razorpay details
      return {
        ...order,
        payment_details: {
          ...paymentDetails,
          razorpay_order_id: razorpayOrder.id,
          razorpay_key: razorpayOrder.key
        }
      };
    }
    
    // For non-Razorpay orders, clear cart now
    if (paymentDetails.method === 'cod') {
      localStorage.removeItem('pytronix-cart');
    }
    
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    toast.error('Failed to create order');
    return null;
  }
};

// Update order status
export const updateOrderStatus = async (id: string, status: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    toast.error('Failed to update order status');
    return null;
  }
};

// Update order tracking information
export const updateOrderTracking = async (
  id: string, 
  trackingInfo: { 
    tracking_id: string;
    tracking_url?: string;
    shipping_carrier?: string;
  }
): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(trackingInfo)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating tracking information:', error);
    toast.error('Failed to update tracking information');
    return null;
  }
};

// Cancel an order
export const cancelOrder = async (id: string): Promise<boolean> => {
  try {
    // First check if order is in a status that can be cancelled
    const { data: order, error: getError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();
      
    if (getError) throw getError;
    
    // Only allow cancellation for pending or processing orders
    if (order.status !== 'pending' && order.status !== 'processing') {
      toast.error('This order cannot be cancelled');
      return false;
    }
    
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    toast.error('Failed to cancel order');
    return false;
  }
};

// Delete an order (admin only, or for testing)
export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    // First delete related order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);
      
    if (itemsError) throw itemsError;
    
    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    toast.error('Failed to delete order');
    return false;
  }
};

// Get order status counts for dashboard
export const getOrderStatusCounts = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status');
      
    if (error) throw error;
    
    // Count occurrences of each status
    const counts: Record<string, number> = {
      pending: 0,
      processing: 0, 
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    data.forEach(order => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error getting order status counts:', error);
    return { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  }
};