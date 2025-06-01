import { supabase } from '../lib/supabaseClient';

/**
 * Loads the Razorpay script
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    
    // Add script to document
    document.body.appendChild(script);
  });
};

/**
 * Creates a Razorpay order
 */
export const createRazorpayOrder = async (
  amount: number, 
  orderId: string
): Promise<{
  id: string;
  key: string;
  amount: number;
  currency: string;
  notes: Record<string, string>;
} | null> => {
  try {
    // Get auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to create an order');
    }
    
    // Call the Razorpay order Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: amount, // in rupees
          orderId: orderId
        }),
      }
    );
    
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || 'Failed to create Razorpay order');
    }
    
    const data = await response.json();
    
    return {
      id: data.id,
      key: data.key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_89CCL7nHE71FCf',
      amount: data.amount,
      currency: data.currency || 'INR',
      notes: data.notes || {}
    };
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
};

/**
 * Verifies Razorpay payment status
 */
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string
): Promise<boolean> => {
  try {
    // Get fresh session for authentication
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    
    if (!session || !session.access_token) {
      console.error('No active session found for payment verification');
      throw new Error('Authentication session has expired. Please login again.');
    }
    
    // Fetch the existing order to preserve payment_details fields like shipping_fee
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('payment_details')
      .eq('id', orderId)
      .single();
    if (fetchError) {
      console.error('Error fetching existing order for payment details:', fetchError);
      throw fetchError;
    }
    const prevPaymentDetails = existingOrder?.payment_details || {};
    
    // Update order payment details in Supabase, merging with previous
    const { data: orderData, error } = await supabase
      .from('orders')
      .update({
        payment_details: {
          ...prevPaymentDetails,
          status: 'paid',
          method: 'razorpay',
          razorpay_payment_id: paymentId,
          payment_timestamp: new Date().toISOString(),
        },
        status: 'processing', // Update order status to processing once payment is confirmed
        razorpay_payment_id: paymentId
      })
      .eq('id', orderId)
      .select();
    
    if (error) {
      console.error('Error updating order payment details:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};