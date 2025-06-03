import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { Order, OrderCancellationRequest, Workshop, WorkshopRequest } from '../types';
import emailTemplates from './emailTemplates';

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
      company_email: 'noreply@phytronix.co.in',
      company_logo: 'https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png',
      from_name: 'Phytronix',
      from_email: 'noreply@phytronix.co.in',
      reply_to: 'support@phytronix.co.in'
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
 * Process HTML template with data
 */
const processTemplate = (template: string, data: Record<string, any>): string => {
  let processedTemplate = template;
  
  // Replace placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, String(value));
  });
  
  // Process conditional blocks
  const conditionalRegex = /{{#if ([^}]+)}}([\s\S]*?){{\/if}}/g;
  processedTemplate = processedTemplate.replace(conditionalRegex, (match, condition, content) => {
    const conditionValue = data[condition];
    return conditionValue ? content : '';
  });
  
  // Process order items for HTML table
  if (data.order_items) {
    try {
      const items = JSON.parse(data.order_items);
      let itemsHtml = '';
      
      items.forEach((item: any) => {
        itemsHtml += `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toLocaleString()}</td>
          </tr>
        `;
      });
      
      processedTemplate = processedTemplate.replace('{{order_items_html}}', itemsHtml);
    } catch (error) {
      console.error('Error processing order items:', error);
    }
  }
  
  // Process cart items for HTML table
  if (data.cart_items) {
    try {
      const items = JSON.parse(data.cart_items);
      let itemsHtml = '';
      
      items.forEach((item: any) => {
        itemsHtml += `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price.toLocaleString()}</td>
          </tr>
        `;
      });
      
      processedTemplate = processedTemplate.replace('{{cart_items_html}}', itemsHtml);
    } catch (error) {
      console.error('Error processing cart items:', error);
    }
  }
  
  return processedTemplate;
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

    // Get the template
    const template = emailTemplates.orderConfirmation;
    
    // Process the template with data
    const processedTemplate = processTemplate(template, {
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
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: `Order Confirmation #${order.id.substring(0, 8)}`,
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

/**
 * Send order shipped email
 */
export const sendOrderShippedEmail = async (order: Order): Promise<boolean> => {
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

    // Format shipping address
    const shippingAddress = order.shipping_address;
    const formattedAddress = `${shippingAddress.full_name}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}, ${shippingAddress.country}`;

    // Get the template
    const template = emailTemplates.orderShipped;
    
    // Process the template with data
    const processedTemplate = processTemplate(template, {
      customer_name: shippingAddress.full_name,
      order_id: order.id.substring(0, 8),
      tracking_id: order.tracking_id || 'Not available',
      shipping_carrier: order.shipping_carrier || 'Our shipping partner',
      tracking_url: order.tracking_url || '',
      shipping_address: formattedAddress,
      estimated_delivery: getEstimatedDeliveryDate(new Date()),
      order_link: `${window.location.origin}/orders/${order.id}`
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: `Your Order #${order.id.substring(0, 8)} Has Been Shipped`,
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
  } catch (error) {
    console.error('Error sending order shipped email:', error);
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

    // Get the template
    const template = emailTemplates.paymentConfirmation;
    
    // Process the template with data
    const processedTemplate = processTemplate(template, {
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
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: `Payment Confirmation for Order #${order.id.substring(0, 8)}`,
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
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

    // Determine template and subject based on status
    let template: string;
    let subject: string;

    switch (status) {
      case 'shipped':
        return sendOrderShippedEmail(order);
      case 'delivered':
        template = emailTemplates.orderDelivered;
        subject = `Your Order #${order.id.substring(0, 8)} Has Been Delivered`;
        break;
      case 'cancelled':
        template = emailTemplates.orderCancelled;
        subject = `Your Order #${order.id.substring(0, 8)} Has Been Cancelled`;
        break;
      case 'processing':
      default:
        template = emailTemplates.orderConfirmation;
        subject = `Your Order #${order.id.substring(0, 8)} is Being Processed`;
        break;
    }

    // Format shipping address
    const shippingAddress = order.shipping_address;
    const formattedAddress = `${shippingAddress.full_name}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}, ${shippingAddress.country}`;

    // Process the template with data
    const processedTemplate = processTemplate(template, {
      customer_name: shippingAddress.full_name,
      order_id: order.id.substring(0, 8),
      order_date: new Date(order.created_at).toLocaleDateString('en-IN'),
      shipping_address: formattedAddress,
      delivery_date: new Date().toLocaleDateString('en-IN'),
      cancellation_date: new Date().toLocaleDateString('en-IN'),
      cancellation_reason: 'Customer request',
      order_link: `${window.location.origin}/orders/${order.id}`,
      review_link: `${window.location.origin}/orders/${order.id}#reviews`
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: subject,
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
  } catch (error) {
    console.error(`Error sending ${status} email:`, error);
    return false;
  }
};

/**
 * Send abandoned cart email
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

    // Get the template
    const template = emailTemplates.abandonedCart;
    
    // Process the template with data
    const processedTemplate = processTemplate(template, {
      customer_name: userName,
      cart_items: JSON.stringify(formattedItems),
      cart_total: `₹${cartTotal.toLocaleString('en-IN')}`,
      cart_link: `${window.location.origin}/cart`,
      expiry_time: '48 hours',
      unsubscribe_link: `${window.location.origin}/unsubscribe`
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Complete Your Purchase at Phytronix',
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
  } catch (error) {
    console.error('Error sending abandoned cart email:', error);
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
    // Get the template
    const template = emailTemplates.welcome;
    
    // Process the template with data
    const processedTemplate = processTemplate(template, {
      customer_name: userName,
      login_link: `${window.location.origin}/login`,
      products_link: `${window.location.origin}/products`,
      support_email: 'support@phytronix.co.in',
      support_phone: '+91 9876 543 210'
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Welcome to Phytronix!',
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
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
    // Get the template
    const template = emailTemplates.passwordReset;
    
    // Process the template with data
    const processedTemplate = processTemplate(template, {
      reset_link: resetLink,
      expiry_time: '1 hour',
      support_email: 'support@phytronix.co.in'
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Reset Your Phytronix Password',
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
  } catch (error) {
    console.error('Error sending password reset email:', error);
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

    // Get the template
    const template = emailTemplates.workshopRequest;
    
    // Process the template with data
    const processedTemplate = processTemplate(template, {
      contact_name: request.contact_name,
      institution_name: request.institution_name,
      institution_type: request.institution_type,
      workshop_title: workshop?.title || 'Requested Workshop',
      preferred_dates: formattedDates,
      participants: request.participants,
      additional_requirements: request.additional_requirements || 'None specified',
      request_date: new Date().toLocaleDateString('en-IN'),
      estimated_response_time: '2-3 business days'
    });

    // Prepare template parameters
    const templateParams = {
      to_email: userEmail,
      subject: 'Workshop Request Confirmation',
      template_content: processedTemplate
    };

    // Send the email
    return await sendEmail(templateParams);
  } catch (error) {
    console.error('Error sending workshop request email:', error);
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