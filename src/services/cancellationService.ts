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
    
    // Create notification for the user
    try {
      await supabase.rpc('create_user_notification', {
        p_user_id: userId,
        p_type: type === 'cancel' ? 'cancellation_submitted' : 'replacement_submitted',
        p_title: type === 'cancel' ? 'Cancellation Request Submitted' : 'Replacement Request Submitted',
        p_message: `Your ${type === 'cancel' ? 'cancellation' : 'replacement'} request has been submitted and is under review.`,
        p_data: { 
          order_id: orderId,
          request_id: data.id,
          request_type: type
        }
      });
    } catch (notificationError) {
      console.error('Error creating request notification:', notificationError);
      // Don't throw error for notification failure
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
        order:orders(
          id,
          status,
          total,
          created_at,
          payment_details
        ),
        profile:profiles(
          full_name,
          email
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
      .select('*, order:orders(user_id)')
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
    
    // Create notification for the user
    if (request.order && request.order.user_id) {
      try {
        await supabase.rpc('create_user_notification', {
          p_user_id: request.order.user_id,
          p_type: request.type === 'cancel' 
            ? (status === 'approved' ? 'cancellation_approved' : 'cancellation_rejected')
            : (status === 'approved' ? 'replacement_approved' : 'replacement_rejected'),
          p_title: `${request.type === 'cancel' ? 'Cancellation' : 'Replacement'} Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          p_message: adminResponse || 
            (status === 'approved' 
              ? `Your ${request.type === 'cancel' ? 'cancellation' : 'replacement'} request has been approved.` 
              : `Your ${request.type === 'cancel' ? 'cancellation' : 'replacement'} request has been rejected.`),
          p_data: { 
            order_id: request.order_id,
            request_id: requestId,
            request_type: request.type,
            status: status
          }
        });
      } catch (notificationError) {
        console.error('Error creating request notification:', notificationError);
        // Don't throw error for notification failure
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateCancellationRequest:', error);
    throw error;
  }
};