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
          setError("Failed to load payment gateway. Please refresh the page.");
        }
      } catch (error) {
        console.error('Error loading Razorpay script:', error);
        setError("Failed to load payment gateway");
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
    if (!order || !order.payment_details?.razorpay_order_id || !order.payment_details?.razorpay_key) {
      setError("Payment information missing");
      toast.error('Payment information missing');
      return;
    }
    
    if (!window.Razorpay) {
      setError("Payment gateway not available");
      toast.error('Payment gateway not available');
      return;
    }
    
    // Check for active session
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setError("Your session has expired. Please log in again.");
      toast.error('Session expired, please log in again');
      if (onCancel) onCancel();
      return;
    }
    
    // Initialize Razorpay checkout
    const options = {
      key: order.payment_details.razorpay_key,
      amount: Number(order.total) * 100, // convert to paisa
      currency: 'INR',
      name: 'Phytronix Electronics',
      description: `Order #${order.id.substring(0, 8)}...`,
      image: 'https://via.placeholder.com/150x150.png?text=P',
      order_id: order.payment_details.razorpay_order_id,
      handler: async function (response: any) {
        try {
          setLoading(true);
          
          // Payment verification using our simplified approach
          const success = await verifyRazorpayPayment(
            response.razorpay_payment_id,
            order.id
          );
          
          if (success) {
            if (onSuccess) {
              onSuccess();
            }
          } else {
            setError('Payment verification failed');
            if (onCancel) {
              onCancel();
            }
          }
        } catch (error) {
          console.error('Error handling payment:', error);
          const errorMessage = error instanceof Error ? error.message : 'Payment processing error';
          setError(errorMessage);
          setPaymentError(`Payment setup failed: ${errorMessage}. Please try again later.`);
          toast.error('Payment gateway error. Please try again later.');
          
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
          if (onCancel) {
            onCancel();
          }
        },
      },
    };
    
    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        const errorMsg = response.error.description || "Payment failed";
        setError(errorMsg);
        setPaymentError(`Payment setup failed: ${errorMsg}. Please try again later.`);
        if (onCancel) {
          onCancel();
        }
      });
      rzp.open();
    } catch (e) {
      console.error('Error opening Razorpay:', e);
      setError('Failed to open payment gateway');
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
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return null; // Razorpay checkout is handled by useEffect
};

export default RazorpayCheckout;