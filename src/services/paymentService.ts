import { supabase } from '../lib/supabaseClient';

// Create a Razorpay order
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
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: amount, // in rupees
          currency: 'INR',
          receipt: `receipt_order_${orderId.substring(0, 8)}`,
          notes: {
            order_reference: orderId
          },
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
      id: data.data.id,
      key: data.key_id,
      amount: data.data.amount,
      currency: data.data.currency,
      notes: data.data.notes
    };
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
};

// Verify payment status
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string
): Promise<boolean> => {
  try {
    // In a production app, you would verify this server-side through your webhook handler
    // For now, we'll check if both paymentId and orderId exist
    if (!paymentId || !orderId) {
      return false;
    }
    
    // Update order payment details in Supabase
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_details: {
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
    return false;
  }
};

// Load the Razorpay SDK dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};