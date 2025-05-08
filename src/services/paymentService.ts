import { supabaseClient } from '../lib/supabaseClient';

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
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    
    // Add script to document
    document.body.appendChild(script);
  });
};

/**
 * Creates a new Razorpay order
 */
export const createRazorpayOrder = async (orderId: string): Promise<any> => {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ orderId }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Razorpay order: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

/**
 * Verifies a Razorpay payment
 */
export const verifyRazorpayPayment = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  accessToken?: string
): Promise<boolean> => {
  try {
    // If no access token is provided, try to get it from the current session
    let token = accessToken;
    if (!token) {
      const { data: { session } } = await supabaseClient.auth.getSession();
      token = session?.access_token;
    }
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-verify-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          razorpayOrderId,
          razorpayPaymentId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Payment verification failed: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};