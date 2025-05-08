import { supabase } from '../lib/supabaseClient';

// Create a Razorpay order
export const createRazorpayOrder = async (
  orderId: string, 
  amount: number
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
          orderId,
          amount, // in rupees
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
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_89CCL7nHE71FCf',
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
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<boolean> => {
  try {
    // Get auth session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to verify payment');
    }
    
    // Call the verify payment Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          orderId,
          razorpayOrderId,
          razorpayPaymentId,
        }),
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Payment verification failed: ${errorText}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
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
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};