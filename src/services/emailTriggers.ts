import { supabase } from '../lib/supabaseClient';
import { 
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderStatusEmail,
  sendRequestConfirmationEmail,
  sendRequestStatusEmail,
  sendWorkshopRequestEmail,
  sendWorkshopRequestStatusEmail,
  sendAbandonedCartEmail,
  sendFeedbackRequestEmail,
  sendWelcomeEmail,
  emailQueue
} from './emailService';
import { Order, OrderCancellationRequest, Workshop, WorkshopRequest } from '../types';
import { toast } from 'react-hot-toast';

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
              // Queue email based on new status
              switch (newStatus) {
                case 'processing':
                  emailQueue.enqueue(
                    'template_order_processing',
                    { order },
                    'high'
                  );
                  break;
                case 'shipped':
                  emailQueue.enqueue(
                    'template_order_shipped',
                    { order },
                    'high'
                  );
                  break;
                case 'delivered':
                  emailQueue.enqueue(
                    'template_order_delivered',
                    { order },
                    'high'
                  );
                  
                  // Schedule feedback request email for 3 days later
                  setTimeout(() => {
                    emailQueue.enqueue(
                      'template_feedback_request',
                      { order },
                      'low'
                    );
                  }, 3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
                  
                  break;
                case 'cancelled':
                  emailQueue.enqueue(
                    'template_order_cancelled',
                    { order },
                    'high'
                  );
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

  // Listen for cancellation/replacement request changes
  const requestChanges = supabase
    .channel('request-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'order_cancellation_requests' },
      async (payload) => {
        try {
          if (payload.eventType === 'INSERT') {
            // New request created
            const request = payload.new as OrderCancellationRequest;
            
            // Get the order details
            const { data: order } = await supabase
              .from('orders')
              .select('*')
              .eq('id', request.order_id)
              .single();
              
            if (order) {
              // Send confirmation email
              emailQueue.enqueue(
                request.type === 'cancel' ? 'template_cancellation_request' : 'template_replacement_request',
                { request, order },
                'medium'
              );
            }
          } else if (payload.eventType === 'UPDATE') {
            // Request status updated
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            
            // Only trigger if status has changed
            if (oldStatus !== newStatus && (newStatus === 'approved' || newStatus === 'rejected')) {
              const request = payload.new as OrderCancellationRequest;
              
              // Get the order details
              const { data: order } = await supabase
                .from('orders')
                .select('*')
                .eq('id', request.order_id)
                .single();
                
              if (order) {
                // Send status update email
                emailQueue.enqueue(
                  request.type === 'cancel' 
                    ? (newStatus === 'approved' ? 'template_cancellation_approved' : 'template_cancellation_rejected')
                    : (newStatus === 'approved' ? 'template_replacement_approved' : 'template_replacement_rejected'),
                  { request, order },
                  'medium'
                );
              }
            }
          }
        } catch (error) {
          console.error('Error processing request change for email:', error);
        }
      }
    )
    .subscribe();

  // Listen for workshop request changes
  const workshopRequestChanges = supabase
    .channel('workshop-request-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'workshop_requests' },
      async (payload) => {
        try {
          if (payload.eventType === 'INSERT') {
            // New workshop request created
            const request = payload.new as WorkshopRequest;
            
            // Get the workshop details if available
            let workshop: Workshop | undefined;
            if (request.workshop_id) {
              const { data } = await supabase
                .from('workshops')
                .select('*')
                .eq('id', request.workshop_id)
                .single();
                
              workshop = data;
            }
            
            // Send confirmation email
            emailQueue.enqueue(
              'template_workshop_request',
              { request, workshop },
              'medium'
            );
          } else if (payload.eventType === 'UPDATE') {
            // Request status updated
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;
            
            // Only trigger if status has changed
            if (oldStatus !== newStatus && (newStatus === 'approved' || newStatus === 'rejected')) {
              const request = payload.new as WorkshopRequest;
              
              // Get the workshop details if available
              let workshop: Workshop | undefined;
              if (request.workshop_id) {
                const { data } = await supabase
                  .from('workshops')
                  .select('*')
                  .eq('id', request.workshop_id)
                  .single();
                  
                workshop = data;
              }
              
              // Send status update email
              emailQueue.enqueue(
                newStatus === 'approved' ? 'template_workshop_approved' : 'template_workshop_rejected',
                { request, workshop },
                'medium'
              );
            }
          }
        } catch (error) {
          console.error('Error processing workshop request change for email:', error);
        }
      }
    )
    .subscribe();

  // Return unsubscribe functions for cleanup
  return () => {
    orderChanges.unsubscribe();
    requestChanges.unsubscribe();
    workshopRequestChanges.unsubscribe();
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
 * Trigger abandoned cart email
 * This should be called by a scheduled function or cron job
 */
export const triggerAbandonedCartEmails = async (): Promise<void> => {
  try {
    // Get abandoned carts from localStorage or database
    // This is a simplified example - in production, you'd need a server-side solution
    const abandonedCarts = await getAbandonedCarts();
    
    for (const cart of abandonedCarts) {
      const success = await sendAbandonedCartEmail(
        cart.userEmail,
        cart.userName,
        cart.items
      );
      
      if (success) {
        console.log(`Abandoned cart email sent to ${cart.userEmail}`);
        // Mark this cart as notified in your tracking system
      } else {
        console.error(`Failed to send abandoned cart email to ${cart.userEmail}`);
      }
    }
  } catch (error) {
    console.error('Error triggering abandoned cart emails:', error);
  }
};

/**
 * Trigger welcome email for new users
 */
export const triggerWelcomeEmail = async (userEmail: string, userName: string): Promise<void> => {
  try {
    const success = await sendWelcomeEmail(userEmail, userName);
    if (success) {
      console.log('Welcome email sent successfully');
    } else {
      console.error('Failed to send welcome email');
    }
  } catch (error) {
    console.error('Error triggering welcome email:', error);
  }
};

// Mock function to get abandoned carts - in production, this would be a database query
const getAbandonedCarts = async (): Promise<{ userEmail: string; userName: string; items: any[] }[]> => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Query your database for carts that were active but not completed
  // 2. Filter for carts that were last updated 24 hours ago
  // 3. Return the cart data with user information
  
  return []; // Placeholder empty array
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
  
  // Set up abandoned cart check (every 24 hours)
  // In production, this should be a server-side scheduled job
  setInterval(() => {
    triggerAbandonedCartEmails();
  }, 24 * 60 * 60 * 1000); // 24 hours
};