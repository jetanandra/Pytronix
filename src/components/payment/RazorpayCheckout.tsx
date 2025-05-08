import React, { useEffect, useState } from 'react';
import { loadRazorpayScript, verifyRazorpayPayment } from '../../services/paymentService';
import { Order } from '../../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoaderSpinner from '../ui/LoaderSpinner';
import { useAuth } from '../../context/AuthContext';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    const loadScript = async () => {
      try {
        setLoading(true);
        const loaded = await loadRazorpayScript();
        setScriptLoaded(loaded);
      } catch (error) {
        console.error('Error loading Razorpay script:', error);
        toast.error('Failed to load payment gateway');
      } finally {
        setLoading(false);
      }
    };
    
    loadScript();
  }, []);
  
  useEffect(() => {
    if (scriptLoaded && order && order.payment_details?.razorpay_order_id && order.payment_details?.razorpay_key) {
      openRazorpayCheckout();
    }
  }, [scriptLoaded, order]);
  
  const openRazorpayCheckout = () => {
    if (!order || !order.payment_details?.razorpay_order_id || !order.payment_details?.razorpay_key) {
      toast.error('Payment information missing');
      return;
    }
    
    if (!window.Razorpay) {
      toast.error('Payment gateway not available');
      return;
    }
    
    // Initialize Razorpay checkout
    const options = {
      key: order.payment_details.razorpay_key,
      amount: Number(order.total) * 100, // convert to paisa
      currency: 'INR',
      name: 'Pytronix Electronics',
      description: `Order #${order.id.substring(0, 8)}...`,
      image: 'https://via.placeholder.com/150x150.png?text=P',
      order_id: order.payment_details.razorpay_order_id,
      handler: async function (response: any) {
        try {
          setLoading(true);
          
          const success = await verifyRazorpayPayment(
            response.razorpay_payment_id,
            order.id
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
            toast.error('Payment verification failed');
            if (onCancel) {
              onCancel();
            }
          }
        } catch (error) {
          console.error('Error handling payment:', error);
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
          toast.error('Payment cancelled');
          
          if (onCancel) {
            onCancel();
          }
        },
      },
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoaderSpinner size="md" color="blue" />
      </div>
    );
  }
  
  if (!scriptLoaded) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load payment gateway. Please try again or contact support.
        </p>
      </div>
    );
  }
  
  return null; // Razorpay checkout is handled by useEffect
};

export default RazorpayCheckout;