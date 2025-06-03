import { supabase } from '../lib/supabaseClient';
import emailjs from '@emailjs/browser';

// EmailJS service configuration
const EMAILJS_SERVICE_ID = 'service_5ourdnd';
const EMAILJS_PUBLIC_KEY = '-HFTNnRWKK5exFNqg';

// Email template IDs
const TEMPLATES = {
  ORDER_CONFIRMATION: 'template_order_confirmation',
  PAYMENT_CONFIRMATION: 'template_payment_confirmation',
  ORDER_PROCESSING: 'template_order_processing',
  ORDER_SHIPPED: 'template_order_shipped',
  ORDER_DELIVERED: 'template_order_delivered',
  ORDER_CANCELLED: 'template_order_cancelled',
  CANCELLATION_REQUEST: 'template_cancellation_request',
  CANCELLATION_APPROVED: 'template_cancellation_approved',
  CANCELLATION_REJECTED: 'template_cancellation_rejected',
  REPLACEMENT_REQUEST: 'template_replacement_request',
  REPLACEMENT_APPROVED: 'template_replacement_approved',
  REPLACEMENT_REJECTED: 'template_replacement_rejected',
  WORKSHOP_BOOKING: 'template_workshop_booking',
  WORKSHOP_CONFIRMATION: 'template_workshop_confirmation',
  WORKSHOP_REMINDER: 'template_workshop_reminder',
  ABANDONED_CART: 'template_abandoned_cart',
  FEEDBACK_REQUEST: 'template_feedback_request',
  WELCOME_EMAIL: 'template_welcome',
  PASSWORD_RESET: 'template_password_reset'
};

/**
 * Send an email using EmailJS
 */
export const sendEmail = async (
  templateId: string,
  templateParams: Record<string, any>,
  userEmail?: string
): Promise<boolean> => {
  try {
    // Add common template parameters
    const params = {
      ...templateParams,
      website_url: window.location.origin,
      current_year: new Date().getFullYear().toString(),
      recipient_email: userEmail || templateParams.email,
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
export const sendOrderConfirmationEmail = async (
  orderId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    // Get order details from Supabase
    const { data: order, error } = await supabase
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
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order for email:', error);
      return false;
    }

    // Format order items for the email
    const orderItems = order.items.map((item: any) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));

    // Format shipping address
    const shippingAddress = order.shipping_address;
    const formattedAddress = `${shippingAddress.full_name}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}, ${shippingAddress.country}`;

    // Prepare template parameters
    const templateParams = {
      order_id: orderId.substring(0, 8),
      order_date: new Date(order.created_at).toLocaleDateString(),
      customer_name: shippingAddress.full_name,
      email: userEmail,
      shipping_address: formattedAddress,
      payment_method: order.payment_details.method === 'razorpay' ? 'Online Payment' : 'Cash on Delivery',
      order_total: order.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      order_items: JSON.stringify(orderItems),
      order_status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      order_link: `${window.location.origin}/orders/${orderId}`
    };

    // Send the email
    return await sendEmail(TEMPLATES.ORDER_CONFIRMATION, templateParams, userEmail);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (
  orderId: string,
  paymentId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    // Get order details from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order for payment email:', error);
      return false;
    }

    // Prepare template parameters
    const templateParams = {
      order_id: orderId.substring(0, 8),
      payment_id: paymentId,
      payment_date: new Date().toLocaleDateString(),
      customer_name: order.shipping_address.full_name,
      email: userEmail,
      payment_amount: order.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      payment_method: 'Online Payment (Razorpay)',
      order_link: `${window.location.origin}/orders/${orderId}`
    };

    // Send the email
    return await sendEmail(TEMPLATES.PAYMENT_CONFIRMATION, templateParams, userEmail);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return false;
  }
};

/**
 * Send order status update email
 */
export const sendOrderStatusEmail = async (
  orderId: string,
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled',
  userEmail: string,
  trackingInfo?: { trackingId?: string, trackingUrl?: string, carrier?: string }
): Promise<boolean> => {
  try {
    // Get order details from Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order for status email:', error);
      return false;
    }

    // Determine which template to use based on status
    let templateId;
    switch (status) {
      case 'processing':
        templateId = TEMPLATES.ORDER_PROCESSING;
        break;
      case 'shipped':
        templateId = TEMPLATES.ORDER_SHIPPED;
        break;
      case 'delivered':
        templateId = TEMPLATES.ORDER_DELIVERED;
        break;
      case 'cancelled':
        templateId = TEMPLATES.ORDER_CANCELLED;
        break;
      default:
        console.error('Invalid order status for email:', status);
        return false;
    }

    // Prepare template parameters
    const templateParams = {
      order_id: orderId.substring(0, 8),
      customer_name: order.shipping_address.full_name,
      email: userEmail,
      order_date: new Date(order.created_at).toLocaleDateString(),
      order_total: order.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      order_status: status.charAt(0).toUpperCase() + status.slice(1),
      order_link: `${window.location.origin}/orders/${orderId}`,
      tracking_id: trackingInfo?.trackingId || '',
      tracking_url: trackingInfo?.trackingUrl || '',
      shipping_carrier: trackingInfo?.carrier || ''
    };

    // Send the email
    return await sendEmail(templateId, templateParams, userEmail);
  } catch (error) {
    console.error(`Error sending ${status} email:`, error);
    return false;
  }
};

/**
 * Send cancellation request confirmation email
 */
export const sendCancellationRequestEmail = async (
  orderId: string,
  requestType: 'cancel' | 'exchange',
  userEmail: string
): Promise<boolean> => {
  try {
    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order for cancellation email:', error);
      return false;
    }

    // Determine which template to use
    const templateId = requestType === 'cancel' 
      ? TEMPLATES.CANCELLATION_REQUEST 
      : TEMPLATES.REPLACEMENT_REQUEST;

    // Prepare template parameters
    const templateParams = {
      order_id: orderId.substring(0, 8),
      customer_name: order.shipping_address.full_name,
      email: userEmail,
      request_type: requestType === 'cancel' ? 'cancellation' : 'replacement',
      request_date: new Date().toLocaleDateString(),
      order_link: `${window.location.origin}/orders/${orderId}`
    };

    // Send the email
    return await sendEmail(templateId, templateParams, userEmail);
  } catch (error) {
    console.error('Error sending cancellation request email:', error);
    return false;
  }
};

/**
 * Send workshop booking confirmation email
 */
export const sendWorkshopBookingEmail = async (
  workshopId: string,
  bookingDetails: any,
  userEmail: string
): Promise<boolean> => {
  try {
    // Get workshop details
    const { data: workshop, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', workshopId)
      .single();

    if (error) {
      console.error('Error fetching workshop for email:', error);
      return false;
    }

    // Prepare template parameters
    const templateParams = {
      workshop_title: workshop.title,
      workshop_date: bookingDetails.date,
      workshop_time: bookingDetails.time,
      workshop_location: bookingDetails.location || 'To be confirmed',
      customer_name: bookingDetails.name,
      email: userEmail,
      booking_id: bookingDetails.id.substring(0, 8),
      booking_date: new Date().toLocaleDateString(),
      participants: bookingDetails.participants,
      workshop_link: `${window.location.origin}/workshop/${workshopId}`
    };

    // Send the email
    return await sendEmail(TEMPLATES.WORKSHOP_BOOKING, templateParams, userEmail);
  } catch (error) {
    console.error('Error sending workshop booking email:', error);
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
      price: (item.product.discount_price || item.product.price).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      image: item.product.image
    }));

    // Calculate cart total
    const cartTotal = cartItems.reduce((total, item) => {
      const price = item.product.discount_price || item.product.price;
      return total + (price * item.quantity);
    }, 0);

    // Prepare template parameters
    const templateParams = {
      customer_name: userName,
      email: userEmail,
      cart_items: JSON.stringify(formattedItems),
      cart_total: cartTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
      cart_link: `${window.location.origin}/cart`,
      abandoned_date: new Date().toLocaleDateString()
    };

    // Send the email
    return await sendEmail(TEMPLATES.ABANDONED_CART, templateParams, userEmail);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
    return false;
  }
};

/**
 * Send order feedback request email
 */
export const sendFeedbackRequestEmail = async (
  orderId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items (
          *,
          product:products (
            id,
            name,
            image
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order for feedback email:', error);
      return false;
    }

    // Format order items for the email
    const orderItems = order.items.map((item: any) => ({
      id: item.product.id,
      name: item.product.name,
      image: item.product.image
    }));

    // Prepare template parameters
    const templateParams = {
      order_id: orderId.substring(0, 8),
      customer_name: order.shipping_address.full_name,
      email: userEmail,
      order_date: new Date(order.created_at).toLocaleDateString(),
      order_items: JSON.stringify(orderItems),
      feedback_link: `${window.location.origin}/feedback/${orderId}`
    };

    // Send the email
    return await sendEmail(TEMPLATES.FEEDBACK_REQUEST, templateParams, userEmail);
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
      customer_name: userName,
      email: userEmail,
      login_link: `${window.location.origin}/login`
    };

    // Send the email
    return await sendEmail(TEMPLATES.WELCOME_EMAIL, templateParams, userEmail);
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
      email: userEmail,
      reset_link: resetLink,
      expiry_time: '24 hours'
    };

    // Send the email
    return await sendEmail(TEMPLATES.PASSWORD_RESET, templateParams, userEmail);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};