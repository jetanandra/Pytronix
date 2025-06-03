import { supabase } from '../lib/supabaseClient';
import { 
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusEmail,
  sendOrderShippedEmail,
  sendAbandonedCartEmail,
  sendWelcomeEmail,
  emailQueue
} from './emailService';
import { Order } from '../types';

/**
 * Set up real-time triggers for email notifications
 */
export const setupEmailTriggers = () => {
  // Listen for order status changes
  const orderChanges = supabase
    .channel('order-changes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      async (payload) => {
        const oldStatus = payload.old.status;
        const newStatus = payload.new.status;
        
        // Only trigger if status has changed
        if (oldStatus !== newStatus) {
          try {
            // Get the full order details
            const { data: order } = await supabase
              .from('orders')
              .select(`
                *,
                items:order_items (
                  *,
                  product:products (
                    id,
                    name,
                    price,
                    discount_price,
                    image
                  )
                )
              `)
              .eq('id', payload.new.id)
              .single();
              
            if (order) {
              // Send email based on new status
              switch (newStatus) {
                case 'processing':
                  // Order is being processed
                  sendOrderStatusEmail(order, 'processing');
                  break;
                case 'shipped':
                  // Order has been shipped
                  sendOrderShippedEmail(order);
                  break;
                case 'delivered':
                  // Order has been delivered
                  sendOrderStatusEmail(order, 'delivered');
                  break;
                case 'cancelled':
                  // Order has been cancelled
                  sendOrderStatusEmail(order, 'cancelled');
                  break;
              }
            }
          } catch (error) {
            console.error('Error processing order status change for email:', error);
          }
        }
      }
    )
    .subscribe();

  // Return unsubscribe function for cleanup
  return () => {
    orderChanges.unsubscribe();
  };
};

/**
 * Trigger order confirmation email
 */
export const triggerOrderConfirmationEmail = async (order: Order): Promise<void> => {
  try {
    const success = await sendOrderConfirmationEmail(order);
    if (success) {
      console.log('Order confirmation email sent successfully');
    } else {
      console.error('Failed to send order confirmation email');
    }
  } catch (error) {
    console.error('Error triggering order confirmation email:', error);
  }
};

/**
 * Trigger payment confirmation email
 */
export const triggerPaymentConfirmationEmail = async (order: Order, paymentId: string): Promise<void> => {
  try {
    const success = await sendPaymentConfirmationEmail(order, paymentId);
    if (success) {
      console.log('Payment confirmation email sent successfully');
    } else {
      console.error('Failed to send payment confirmation email');
    }
  } catch (error) {
    console.error('Error triggering payment confirmation email:', error);
  }
};

/**
 * Initialize email system
 * Call this function when your app starts
 */
export const initializeEmailSystem = (): void => {
  // Set up real-time triggers
  setupEmailTriggers();
  
  // Log initialization
  console.log('Email notification system initialized');
};