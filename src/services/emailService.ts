import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Order, OrderCancellationRequest, Workshop, WorkshopRequest } from '../types';

// EmailJS service configuration
const EMAILJS_SERVICE_ID = 'service_5ourdnd';
const EMAILJS_TEMPLATE_ID = 'template_2vdwz7h';
const EMAILJS_PUBLIC_KEY = '-HFTNnRWKK5exFNqg';

/**
 * Send an email using EmailJS
 */
export const sendEmail = async (
  templateParams: Record<string, any>,
  templateId: string = EMAILJS_TEMPLATE_ID
): Promise<boolean> => {
  try {
    // Dynamically import emailjs to avoid SSR issues
    const emailjs = await import('@emailjs/browser');
    
    // Add common template parameters
    const params = {
      ...templateParams,
      website_url: window.location.origin,
      current_year: new Date().getFullYear().toString(),
      company_name: 'Phytronix',
      company_address: 'Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India',
      company_phone: '+91 9876 543 210',
      company_email: 'support@phytronix.com',
      company_logo: `${window.location.origin}/src/Logo/Logo-Phytronix.svg`,
    };

    // Send the email
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      params,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (order: Order): Promise<boolean> => {
  try {
    if (!order || !order.shipping_address) {
      console.error('Invalid order data for email');
      return false;
    }

    // Get user email
    const userEmail = order.email;
    if (!userEmail) {
      console.error('No email address found for order');
      return false;
    }

    // Format order items for the email
    const orderItems = order.items?.map(item => ({
      name: item.product?.name || 'Product',
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })) || [];

    // Format shipping address
    const shippingAddress = order.shipping_address;
    const formattedAddress = `${shippingAddress.full_name}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}, ${shippingAddress.country}`;

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: `Order Confirmation #${order.id.substring(0, 8)}`,
      customer_name: shippingAddress.full_name,
      order_id: order.id.substring(0, 8),
      order_date: new Date(order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      order_total: `₹${order.total.toLocaleString('en-IN')}`,
      payment_method: order.payment_details?.method === 'razorpay' ? 'Online Payment' : 'Cash on Delivery',
      shipping_address: formattedAddress,
      order_items: JSON.stringify(orderItems),
      order_status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      order_link: `${window.location.origin}/orders/${order.id}`,
      estimated_delivery: getEstimatedDeliveryDate(new Date()),
    };

    // Send the email
    return await sendEmail(templateParams, 'template_order_confirmation');
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (
  order: Order,
  paymentId: string
): Promise<boolean> => {
  try {
    if (!order || !order.shipping_address) {
      console.error('Invalid order data for payment email');
      return false;
    }

    // Get user email
    const userEmail = order.email;
    if (!userEmail) {
      console.error('No email address found for order');
      return false;
    }

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: `Payment Confirmation for Order #${order.id.substring(0, 8)}`,
      customer_name: order.shipping_address.full_name,
      order_id: order.id.substring(0, 8),
      payment_id: paymentId,
      payment_date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      payment_amount: `₹${order.total.toLocaleString('en-IN')}`,
      payment_method: 'Online Payment (Razorpay)',
      order_link: `${window.location.origin}/orders/${order.id}`
    };

    // Send the email
    return await sendEmail(templateParams, 'template_payment_confirmation');
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return false;
  }
};

/**
 * Send order status update email
 */
export const sendOrderStatusEmail = async (
  order: Order,
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
): Promise<boolean> => {
  try {
    if (!order || !order.shipping_address) {
      console.error('Invalid order data for status email');
      return false;
    }

    // Get user email
    const userEmail = order.email;
    if (!userEmail) {
      console.error('No email address found for order');
      return false;
    }

    // Determine template ID and subject based on status
    let templateId: string;
    let subject: string;
    let statusMessage: string;

    switch (status) {
      case 'processing':
        templateId = 'template_order_processing';
        subject = `Your Order #${order.id.substring(0, 8)} is Being Processed`;
        statusMessage = 'Your order is now being processed. We\'ll update you when it ships.';
        break;
      case 'shipped':
        templateId = 'template_order_shipped';
        subject = `Your Order #${order.id.substring(0, 8)} Has Been Shipped`;
        statusMessage = 'Great news! Your order has been shipped.';
        break;
      case 'delivered':
        templateId = 'template_order_delivered';
        subject = `Your Order #${order.id.substring(0, 8)} Has Been Delivered`;
        statusMessage = 'Your order has been delivered. Enjoy your purchase!';
        break;
      case 'cancelled':
        templateId = 'template_order_cancelled';
        subject = `Your Order #${order.id.substring(0, 8)} Has Been Cancelled`;
        statusMessage = 'Your order has been cancelled. Please contact support if you have any questions.';
        break;
      default:
        console.error('Invalid order status for email');
        return false;
    }

    // Prepare tracking information if available
    let trackingInfo = '';
    if (status === 'shipped' && order.tracking_id) {
      trackingInfo = `
        Tracking Number: ${order.tracking_id}
        Carrier: ${order.shipping_carrier || 'Our shipping partner'}
        ${order.tracking_url ? `Track your package: ${order.tracking_url}` : ''}
      `;
    }

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: subject,
      customer_name: order.shipping_address.full_name,
      order_id: order.id.substring(0, 8),
      order_date: new Date(order.created_at).toLocaleDateString('en-IN'),
      order_status: status.charAt(0).toUpperCase() + status.slice(1),
      status_message: statusMessage,
      tracking_info: trackingInfo,
      order_link: `${window.location.origin}/orders/${order.id}`
    };

    // Send the email
    return await sendEmail(templateParams, templateId);
  } catch (error) {
    console.error(`Error sending ${status} email:`, error);
    return false;
  }
};

/**
 * Send cancellation/replacement request confirmation email
 */
export const sendRequestConfirmationEmail = async (
  request: OrderCancellationRequest,
  order: Order
): Promise<boolean> => {
  try {
    if (!order || !order.shipping_address) {
      console.error('Invalid order data for request email');
      return false;
    }

    // Get user email
    const userEmail = order.email;
    if (!userEmail) {
      console.error('No email address found for order');
      return false;
    }

    // Determine template ID and subject based on request type
    const templateId = request.type === 'cancel' 
      ? 'template_cancellation_request' 
      : 'template_replacement_request';
    
    const subject = request.type === 'cancel'
      ? `Cancellation Request Received for Order #${order.id.substring(0, 8)}`
      : `Replacement Request Received for Order #${order.id.substring(0, 8)}`;

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: subject,
      customer_name: order.shipping_address.full_name,
      order_id: order.id.substring(0, 8),
      request_type: request.type === 'cancel' ? 'cancellation' : 'replacement',
      request_date: new Date().toLocaleDateString('en-IN'),
      request_reason: request.reason,
      order_link: `${window.location.origin}/orders/${order.id}`,
      estimated_response_time: '1-2 business days'
    };

    // Send the email
    return await sendEmail(templateParams, templateId);
  } catch (error) {
    console.error('Error sending request confirmation email:', error);
    return false;
  }
};

/**
 * Send request status update email
 */
export const sendRequestStatusEmail = async (
  request: OrderCancellationRequest,
  order: Order
): Promise<boolean> => {
  try {
    if (!order || !order.shipping_address) {
      console.error('Invalid order data for request status email');
      return false;
    }

    // Get user email
    const userEmail = order.email;
    if (!userEmail) {
      console.error('No email address found for order');
      return false;
    }

    // Determine template ID and subject based on request type and status
    let templateId: string;
    let subject: string;

    if (request.type === 'cancel') {
      templateId = request.status === 'approved' 
        ? 'template_cancellation_approved' 
        : 'template_cancellation_rejected';
      
      subject = request.status === 'approved'
        ? `Cancellation Request Approved for Order #${order.id.substring(0, 8)}`
        : `Cancellation Request Rejected for Order #${order.id.substring(0, 8)}`;
    } else {
      templateId = request.status === 'approved' 
        ? 'template_replacement_approved' 
        : 'template_replacement_rejected';
      
      subject = request.status === 'approved'
        ? `Replacement Request Approved for Order #${order.id.substring(0, 8)}`
        : `Replacement Request Rejected for Order #${order.id.substring(0, 8)}`;
    }

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: subject,
      customer_name: order.shipping_address.full_name,
      order_id: order.id.substring(0, 8),
      request_type: request.type === 'cancel' ? 'cancellation' : 'replacement',
      request_status: request.status,
      admin_response: request.admin_response || 'No additional information provided.',
      order_link: `${window.location.origin}/orders/${order.id}`
    };

    // Send the email
    return await sendEmail(templateParams, templateId);
  } catch (error) {
    console.error('Error sending request status email:', error);
    return false;
  }
};

/**
 * Send workshop request confirmation email
 */
export const sendWorkshopRequestEmail = async (
  request: WorkshopRequest,
  workshop?: Workshop
): Promise<boolean> => {
  try {
    // Get user email
    const userEmail = request.contact_email;
    if (!userEmail) {
      console.error('No email address found for workshop request');
      return false;
    }

    // Format preferred dates
    const formattedDates = request.preferred_dates.map(date => 
      new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    ).join(', ');

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Workshop Request Confirmation',
      contact_name: request.contact_name,
      institution_name: request.institution_name,
      institution_type: request.institution_type,
      workshop_title: workshop?.title || 'Requested Workshop',
      preferred_dates: formattedDates,
      participants: request.participants,
      additional_requirements: request.additional_requirements || 'None specified',
      request_date: new Date().toLocaleDateString('en-IN'),
      estimated_response_time: '2-3 business days'
    };

    // Send the email
    return await sendEmail(templateParams, 'template_workshop_request');
  } catch (error) {
    console.error('Error sending workshop request email:', error);
    return false;
  }
};

/**
 * Send workshop request status update email
 */
export const sendWorkshopRequestStatusEmail = async (
  request: WorkshopRequest,
  workshop?: Workshop
): Promise<boolean> => {
  try {
    // Get user email
    const userEmail = request.contact_email;
    if (!userEmail) {
      console.error('No email address found for workshop request');
      return false;
    }

    // Determine template ID and subject based on status
    const templateId = request.status === 'approved' 
      ? 'template_workshop_approved' 
      : 'template_workshop_rejected';
    
    const subject = request.status === 'approved'
      ? 'Workshop Request Approved'
      : 'Workshop Request Not Approved';

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: subject,
      contact_name: request.contact_name,
      institution_name: request.institution_name,
      workshop_title: workshop?.title || 'Requested Workshop',
      request_status: request.status,
      admin_response: request.admin_response || 'No additional information provided.',
      next_steps: request.status === 'approved' 
        ? 'Our team will contact you shortly to finalize the details and schedule the workshop.'
        : 'Please feel free to submit another request or contact our support team for more information.'
    };

    // Send the email
    return await sendEmail(templateParams, templateId);
  } catch (error) {
    console.error('Error sending workshop request status email:', error);
    return false;
  }
};

/**
 * Send abandoned cart reminder email
 */
export const sendAbandonedCartEmail = async (
  userEmail: string,
  userName: string,
  cartItems: any[]
): Promise<boolean> => {
  try {
    // Format cart items for the email
    const formattedItems = cartItems.map(item => ({
      name: item.product.name,
      quantity: item.quantity,
      price: (item.product.discount_price || item.product.price) * item.quantity
    }));

    // Calculate cart total
    const cartTotal = cartItems.reduce((total, item) => 
      total + (item.product.discount_price || item.product.price) * item.quantity, 0);

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Complete Your Purchase at Phytronix',
      customer_name: userName,
      cart_items: JSON.stringify(formattedItems),
      cart_total: `₹${cartTotal.toLocaleString('en-IN')}`,
      cart_link: `${window.location.origin}/cart`,
      expiry_time: '48 hours'
    };

    // Send the email
    return await sendEmail(templateParams, 'template_abandoned_cart');
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
    return false;
  }
};

/**
 * Send order feedback request email
 */
export const sendFeedbackRequestEmail = async (
  order: Order
): Promise<boolean> => {
  try {
    if (!order || !order.shipping_address) {
      console.error('Invalid order data for feedback email');
      return false;
    }

    // Get user email
    const userEmail = order.email;
    if (!userEmail) {
      console.error('No email address found for order');
      return false;
    }

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: `How was your Phytronix order? (#${order.id.substring(0, 8)})`,
      customer_name: order.shipping_address.full_name,
      order_id: order.id.substring(0, 8),
      order_date: new Date(order.created_at).toLocaleDateString('en-IN'),
      feedback_link: `${window.location.origin}/feedback/${order.id}`,
      review_link: `${window.location.origin}/orders/${order.id}#reviews`
    };

    // Send the email
    return await sendEmail(templateParams, 'template_feedback_request');
  } catch (error) {
    console.error('Error sending feedback request email:', error);
    return false;
  }
};

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string
): Promise<boolean> => {
  try {
    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Welcome to Phytronix!',
      customer_name: userName,
      login_link: `${window.location.origin}/login`,
      products_link: `${window.location.origin}/products`,
      support_email: 'support@phytronix.com',
      support_phone: '+91 9876 543 210'
    };

    // Send the email
    return await sendEmail(templateParams, 'template_welcome');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  userEmail: string,
  resetLink: string
): Promise<boolean> => {
  try {
    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Reset Your Phytronix Password',
      reset_link: resetLink,
      expiry_time: '1 hour',
      support_email: 'support@phytronix.com'
    };

    // Send the email
    return await sendEmail(templateParams, 'template_password_reset');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Helper function to get estimated delivery date (7 days from now)
const getEstimatedDeliveryDate = (orderDate: Date): string => {
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  
  return deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Email queue for high-volume periods
interface QueuedEmail {
  templateId: string;
  templateParams: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
  attempts: number;
  maxAttempts: number;
}

class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing: boolean = false;
  private maxConcurrent: number = 5;
  private currentConcurrent: number = 0;

  // Add email to queue
  public enqueue(
    templateId: string,
    templateParams: Record<string, any>,
    priority: 'high' | 'medium' | 'low' = 'medium',
    maxAttempts: number = 3
  ): void {
    this.queue.push({
      templateId,
      templateParams,
      priority,
      attempts: 0,
      maxAttempts
    });

    // Sort queue by priority
    this.queue.sort((a, b) => {
      const priorityValues = { high: 0, medium: 1, low: 2 };
      return priorityValues[a.priority] - priorityValues[b.priority];
    });

    // Start processing if not already
    if (!this.processing) {
      this.processQueue();
    }
  }

  // Process the email queue
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.currentConcurrent >= this.maxConcurrent) {
      if (this.currentConcurrent === 0) {
        this.processing = false;
      }
      return;
    }

    this.processing = true;
    this.currentConcurrent++;

    const email = this.queue.shift();
    if (!email) {
      this.currentConcurrent--;
      this.processQueue();
      return;
    }

    try {
      const success = await sendEmail(email.templateParams, email.templateId);
      
      if (!success && email.attempts < email.maxAttempts) {
        // Re-queue with increased attempt count
        email.attempts++;
        this.queue.push(email);
      } else if (!success) {
        console.error(`Failed to send email after ${email.maxAttempts} attempts`, email);
      }
    } catch (error) {
      console.error('Error processing queued email:', error);
      
      if (email.attempts < email.maxAttempts) {
        // Re-queue with increased attempt count
        email.attempts++;
        this.queue.push(email);
      }
    } finally {
      this.currentConcurrent--;
      // Process next email
      this.processQueue();
    }
  }

  // Get queue status
  public getStatus(): { queueLength: number, processing: boolean } {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }
}

// Create and export email queue instance
export const emailQueue = new EmailQueue();