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
 * Verifies a Razorpay payment
 */
export const verifyRazorpayPayment = async (
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  accessToken?: string
): Promise<boolean> => {
  try {
    // Validate inputs
    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      console.error('Missing required payment parameters', { orderId, razorpayOrderId, razorpayPaymentId });
      return false;
    }

    // If no access token is provided, try to get it from the current session
    let token = accessToken;
    if (!token) {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }
    
    if (!token) {
      console.error('No authentication token available');
      throw new Error('Authentication required. Please log in again.');
    }
    
    console.log('Verifying payment with order ID:', orderId);
    
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
      const errorText = await response.text();
      console.error('Payment verification API error:', errorText);
      throw new Error(`Payment verification failed: ${errorText}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};