import React, { useEffect, useState } from 'react';
import { loadRazorpayScript, verifyRazorpayPayment } from '../../services/paymentService';
import { Order } from '../../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoaderSpinner from '../ui/LoaderSpinner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface RazorpayCheckoutProps {
  order: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({ order, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const loadScript = async () => {
      try {
        setLoading(true);
        const loaded = await loadRazorpayScript();
        setScriptLoaded(loaded);
        if (!loaded) {
          setError("Failed to load Razorpay script. Please check your internet connection.");
        }
      } catch (error) {
        console.error('Error loading Razorpay script:', error);
        setError("Failed to load payment gateway. Please try again later.");
        toast.error('Failed to load payment gateway');
      } finally {
        setLoading(false);
      }
    };
    
    loadScript();
  }, []);
  
  useEffect(() => {
    if (scriptLoaded && order && order.payment_details?.razorpay_order_id) {
      openRazorpayCheckout();
    }
  }, [scriptLoaded, order]);
  
  const openRazorpayCheckout = async () => {
    if (!order || !order.payment_details?.razorpay_order_id) {
      setError("Payment information is missing");
      toast.error('Payment information missing');
      return;
    }
    
    if (!window.Razorpay) {
      setError("Payment gateway not available. Please refresh the page and try again.");
      toast.error('Payment gateway not available');
      return;
    }
    
    // Get the current session for authentication
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setError("Authentication session has expired. Please log in again.");
      toast.error('Authentication error. Please log in again.');
      if (onCancel) onCancel();
      return;
    }
    
    // Get Razorpay key ID from environment variable
    const keyId = order.payment_details.razorpay_key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_89CCL7nHE71FCf';
    
    // Initialize Razorpay checkout
    const options = {
      key: keyId,
      amount: Number(order.total) * 100, // convert to paisa
      currency: 'INR',
      name: 'Pytronix Electronics',
      description: `Order #${order.id.substring(0, 8)}...`,
      image: 'https://via.placeholder.com/150x150.png?text=P',
      order_id: order.payment_details.razorpay_order_id,
      handler: async function (response: any) {
        try {
          setLoading(true);
          
          // Get fresh session token
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData.session?.access_token;
          
          if (!accessToken) {
            throw new Error('Authentication session has expired');
          }
          
          console.log("Verifying payment with IDs:", {
            orderId: order.id,
            razorpayOrderId: order.payment_details.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id
          });
          
          const success = await verifyRazorpayPayment(
            order.id,
            order.payment_details.razorpay_order_id,
            response.razorpay_payment_id,
            accessToken
          );
          
          if (success) {
            // Clear cart
            localStorage.removeItem('pytronix-cart');
            
            toast.success('Payment successful! Your order has been placed.');
            
            // Call onSuccess callback if provided
            if (onSuccess) {
              onSuccess();
            }
            
            // Navigate to order details page
            navigate(`/orders/${order.id}`);
          } else {
            setError('Payment verification failed. Please contact customer support.');
            toast.error('Payment verification failed');
            if (onCancel) {
              onCancel();
            }
          }
        } catch (error) {
          console.error('Error handling payment:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setError(`Payment processing error: ${errorMessage}`);
          toast.error('Payment processing error');
          
          if (onCancel) {
            onCancel();
          }
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: order.shipping_address?.full_name || '',
        email: user?.email || '',
        contact: order.shipping_address?.phone || '',
      },
      notes: {
        order_id: order.id,
      },
      theme: {
        color: '#3b82f6', // neon-blue color
      },
      modal: {
        ondismiss: function() {
          setError("Payment was cancelled.");
          toast.error('Payment cancelled');
          
          if (onCancel) {
            onCancel();
          }
        },
      },
    };
    
    // Create Razorpay instance
    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        const errorMsg = response.error.description || "Payment failed";
        toast.error(`Payment failed: ${errorMsg}`);
        setError(`Payment failed: ${errorMsg}`);
        if (onCancel) {
          onCancel();
        }
      });
      rzp.open();
    } catch (err) {
      console.error('Error opening Razorpay:', err);
      setError("Failed to open payment gateway. Please try again later.");
      toast.error('Failed to open payment gateway');
      if (onCancel) {
        onCancel();
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoaderSpinner size="md" color="blue" />
      </div>
    );
  }
  
  if (!scriptLoaded || error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">
          {error || "Failed to load payment gateway. Please try again or contact support."}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 btn-primary text-sm"
        >
          Refresh Page
        </button>
      </div>
    );
  }
  
  return null; // Razorpay checkout is handled by useEffect
};

export default RazorpayCheckout;