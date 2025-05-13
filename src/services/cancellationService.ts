import { supabase } from '../lib/supabaseClient';
import { OrderCancellationRequest } from '../types';
import { toast } from 'react-hot-toast';

/**
 * Submit a cancellation request
 */
export const submitCancellationRequest = async (
  orderId: string,
  type: 'cancel' | 'exchange',
  reason: string
): Promise<OrderCancellationRequest> => {
  try {
    // Get the current user's ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("You must be logged in to request a cancellation");
    }
    
    const userId = session.user.id;
    
    // Create the cancellation request
    const { data, error } = await supabase
      .from('order_cancellation_requests')
      .insert([
        {
          order_id: orderId,
          user_id: userId,
          type,
          reason
        }
      ])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating cancellation request:', error);
      throw new Error(`Failed to submit request: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    console.error('Error in submitCancellationRequest:', error);
    throw error;
  }
};

/**
 * Get cancellation requests for a specific order
 */
export const getCancellationRequestsByOrderId = async (orderId: string): Promise<OrderCancellationRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('order_cancellation_requests')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching cancellation requests:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getCancellationRequestsByOrderId:', error);
    return [];
  }
};

/**
 * Get all cancellation requests (admin function)
 */
export const getAllCancellationRequests = async (): Promise<OrderCancellationRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('order_cancellation_requests')
      .select(`
        *,
        order:orders!inner(
          id,
          status,
          total,
          created_at,
          payment_details
        ),
        profile:profiles!inner(
          full_name,
          email:auth.users!inner(email)
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching all cancellation requests:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllCancellationRequests:', error);
    return [];
  }
};

/**
 * Update a cancellation request (admin function)
 */
export const updateCancellationRequest = async (
  requestId: string,
  status: 'approved' | 'rejected',
  adminResponse?: string
): Promise<OrderCancellationRequest> => {
  try {
    // Get the request first to determine if it's a cancellation or replacement
    const { data: request, error: getError } = await supabase
      .from('order_cancellation_requests')
      .select('*')
      .eq('id', requestId)
      .single();
      
    if (getError) {
      console.error('Error fetching request:', getError);
      throw getError;
    }
    
    // Update the request
    const { data, error } = await supabase
      .from('order_cancellation_requests')
      .update({
        status,
        admin_response: adminResponse || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating cancellation request:', error);
      throw error;
    }
    
    // If approved and it's a cancellation (not an exchange), update the order status
    if (status === 'approved' && request.type === 'cancel') {
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_details: {
            ...request.payment_details,
            status: 'cancelled'
          }
        })
        .eq('id', request.order_id);
        
      if (orderError) {
        console.error('Error updating order status:', orderError);
        toast.error('Request approved but failed to update order status');
      }
    }
    
    // If it's an exchange and we're approving it, we'd handle the exchange logic here
    // This would depend on your business logic for handling exchanges
    
    return data;
  } catch (error) {
    console.error('Error in updateCancellationRequest:', error);
    throw error;
  }
};