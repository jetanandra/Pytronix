// Email Templates for Phytronix E-commerce Platform
// These templates use HTML with variable placeholders that will be replaced at runtime

const emailTemplates = {
  // Order Confirmation Email
  orderConfirmation: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .order-info { background-color: #f0f7ff; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .order-details { margin: 20px 0; }
        .product-table { width: 100%; border-collapse: collapse; }
        .product-table th, .product-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        .product-table th { background-color: #f5f5f5; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .total-row { font-weight: bold; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Order Confirmation</h1>
        </div>
        
        <p>Dear {{customer_name}},</p>
        
        <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
        
        <div class="order-info">
          <p><strong>Order Number:</strong> #{{order_id}}</p>
          <p><strong>Order Date:</strong> {{order_date}}</p>
          <p><strong>Payment Method:</strong> {{payment_method}}</p>
          <p><strong>Shipping Address:</strong> {{shipping_address}}</p>
        </div>
        
        <div class="order-details">
          <h2>Order Summary</h2>
          <table class="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <!-- Order items will be inserted here dynamically -->
              {{order_items_html}}
              
              <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total:</td>
                <td>{{order_total}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p>You can track your order status by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{order_link}}" class="button">Track Your Order</a>
        </div>
        
        <p>Your order is expected to be delivered by <strong>{{estimated_delivery}}</strong>.</p>
        
        <p>If you have any questions or concerns about your order, please don't hesitate to contact our customer support team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <p>Thank you for shopping with Phytronix!</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Payment Confirmation Email
  paymentConfirmation: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .payment-info { background-color: #f0fff0; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Payment Confirmation</h1>
        </div>
        
        <p>Dear {{customer_name}},</p>
        
        <p>We're writing to confirm that we've received your payment for order #{{order_id}}. Thank you!</p>
        
        <div class="payment-info">
          <p><strong>Payment ID:</strong> {{payment_id}}</p>
          <p><strong>Payment Date:</strong> {{payment_date}}</p>
          <p><strong>Amount Paid:</strong> {{payment_amount}}</p>
          <p><strong>Payment Method:</strong> {{payment_method}}</p>
        </div>
        
        <p>Your order is now being processed. We'll send you another email once your order has been shipped.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{order_link}}" class="button">View Order Details</a>
        </div>
        
        <p>If you have any questions or concerns about your payment, please don't hesitate to contact our customer support team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <p>Thank you for shopping with Phytronix!</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Order Shipped Email
  orderShipped: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Been Shipped</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .shipping-info { background-color: #f0f7ff; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .tracking-info { background-color: #e6f7ff; border-radius: 5px; padding: 15px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Your Order Has Been Shipped!</h1>
        </div>
        
        <p>Dear {{customer_name}},</p>
        
        <p>Great news! Your order #{{order_id}} has been shipped and is on its way to you.</p>
        
        <div class="tracking-info">
          <h3 style="margin-top: 0;">Tracking Information</h3>
          <p><strong>Tracking Number:</strong> {{tracking_id}}</p>
          <p><strong>Carrier:</strong> {{shipping_carrier}}</p>
          {{#if tracking_url}}
          <p><a href="{{tracking_url}}" class="button">Track Your Package</a></p>
          {{/if}}
        </div>
        
        <div class="shipping-info">
          <p><strong>Shipping Address:</strong> {{shipping_address}}</p>
          <p><strong>Estimated Delivery Date:</strong> {{estimated_delivery}}</p>
        </div>
        
        <p>You can also view your order details and tracking information by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{order_link}}" class="button">View Order Details</a>
        </div>
        
        <p>If you have any questions or concerns about your shipment, please don't hesitate to contact our customer support team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <p>Thank you for shopping with Phytronix!</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Order Delivered Email
  orderDelivered: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Been Delivered</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .delivery-info { background-color: #f0fff0; border-radius: 5px; padding: 15px; margin: 20px 0; border-left: 4px solid #22c55e; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .review-button { display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Your Order Has Been Delivered!</h1>
        </div>
        
        <p>Dear {{customer_name}},</p>
        
        <p>We're happy to inform you that your order #{{order_id}} has been delivered!</p>
        
        <div class="delivery-info">
          <h3 style="margin-top: 0;">Delivery Information</h3>
          <p><strong>Delivery Date:</strong> {{delivery_date}}</p>
          <p><strong>Delivery Address:</strong> {{shipping_address}}</p>
        </div>
        
        <p>We hope you're enjoying your purchase. If you have a moment, we'd love to hear your feedback about your products and shopping experience.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{review_link}}" class="review-button">Write a Review</a>
        </div>
        
        <p>You can also view your order details by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{order_link}}" class="button">View Order Details</a>
        </div>
        
        <p>If you have any questions or concerns about your delivery, please don't hesitate to contact our customer support team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <p>Thank you for shopping with Phytronix!</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Order Cancelled Email
  orderCancelled: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Order Has Been Cancelled</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .cancellation-info { background-color: #fff0f0; border-radius: 5px; padding: 15px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Your Order Has Been Cancelled</h1>
        </div>
        
        <p>Dear {{customer_name}},</p>
        
        <p>We're writing to confirm that your order #{{order_id}} has been cancelled as requested.</p>
        
        <div class="cancellation-info">
          <h3 style="margin-top: 0;">Cancellation Details</h3>
          <p><strong>Order Number:</strong> #{{order_id}}</p>
          <p><strong>Order Date:</strong> {{order_date}}</p>
          <p><strong>Cancellation Date:</strong> {{cancellation_date}}</p>
          <p><strong>Reason:</strong> {{cancellation_reason}}</p>
          {{#if refund_message}}
          <p><strong>Refund Information:</strong> {{refund_message}}</p>
          {{/if}}
        </div>
        
        <p>You can view your cancelled order details by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{order_link}}" class="button">View Order Details</a>
        </div>
        
        <p>We're sorry that you had to cancel your order. If there's anything we can do to improve your experience in the future, please let us know.</p>
        
        <p>If you have any questions or concerns about your cancellation, please don't hesitate to contact our customer support team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <p>Thank you for considering Phytronix. We hope to serve you better in the future.</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Abandoned Cart Email
  abandonedCart: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Complete Your Purchase</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .cart-info { background-color: #f0f7ff; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .product-table { width: 100%; border-collapse: collapse; }
        .product-table th, .product-table td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
        .product-table th { background-color: #f5f5f5; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .total-row { font-weight: bold; }
        .expiry-notice { font-size: 12px; color: #777; font-style: italic; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Your Cart is Waiting!</h1>
        </div>
        
        <p>Dear {{customer_name}},</p>
        
        <p>We noticed that you left some items in your shopping cart. Don't worry, we've saved them for you!</p>
        
        <div class="cart-info">
          <h3>Your Cart Items</h3>
          <table class="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              <!-- Cart items will be inserted here dynamically -->
              {{cart_items_html}}
              
              <tr class="total-row">
                <td colspan="2" style="text-align: right;">Total:</td>
                <td>{{cart_total}}</td>
              </tr>
            </tbody>
          </table>
          <p class="expiry-notice">Your cart will be saved for {{expiry_time}}.</p>
        </div>
        
        <p>Ready to complete your purchase? Click the button below to return to your cart:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{cart_link}}" class="button">Complete Your Purchase</a>
        </div>
        
        <p>If you have any questions or need assistance with your purchase, our customer support team is here to help. Contact us at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p><small>If you no longer wish to receive these emails, you can <a href="{{unsubscribe_link}}">unsubscribe</a>.</small></p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Feedback Request Email
  feedbackRequest: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We'd Love Your Feedback</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .order-info { background-color: #f0f7ff; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .review-button { display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .stars { font-size: 24px; color: #f59e0b; letter-spacing: 5px; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">How Was Your Experience?</h1>
        </div>
        
        <p>Dear {{customer_name}},</p>
        
        <p>Thank you for your recent purchase from Phytronix! We hope you're enjoying your new products.</p>
        
        <div class="order-info">
          <p><strong>Order Number:</strong> #{{order_id}}</p>
          <p><strong>Order Date:</strong> {{order_date}}</p>
        </div>
        
        <p>We'd love to hear about your experience. Your feedback helps us improve our products and services for you and other customers.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p class="stars">★★★★★</p>
          <a href="{{feedback_link}}" class="review-button">Share Your Feedback</a>
        </div>
        
        <p>You can also write a review for the specific products you purchased:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{review_link}}" class="button">Write a Product Review</a>
        </div>
        
        <p>If you have any questions or need assistance with your purchase, our customer support team is here to help. Contact us at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <p>Thank you for choosing Phytronix!</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p><small>If you no longer wish to receive these emails, you can <a href="{{unsubscribe_link}}">unsubscribe</a>.</small></p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Welcome Email
  welcome: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Phytronix</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .welcome-box { background-color: #f0f7ff; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: center; }
        .features { display: flex; justify-content: space-between; margin: 30px 0; }
        .feature { width: 30%; text-align: center; }
        .feature-icon { font-size: 36px; margin-bottom: 10px; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
          .features { flex-direction: column; }
          .feature { width: 100%; margin-bottom: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Welcome to Phytronix!</h1>
        </div>
        
        <div class="welcome-box">
          <h2>Hello, {{customer_name}}!</h2>
          <p>Thank you for creating an account with Phytronix. We're excited to have you join our community of engineers, hobbyists, and makers!</p>
        </div>
        
        <p>With your new account, you can:</p>
        
        <ul>
          <li>Track your orders and view order history</li>
          <li>Save your favorite products to your wishlist</li>
          <li>Receive exclusive offers and discounts</li>
          <li>Get updates on new products and workshops</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{login_link}}" class="button">Sign In to Your Account</a>
        </div>
        
        <p>Ready to start shopping? Check out our latest products:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="{{products_link}}" class="button" style="background-color: #22c55e;">Browse Products</a>
        </div>
        
        <p>If you have any questions or need assistance, our customer support team is here to help. Contact us at <a href="mailto:{{support_email}}">{{support_email}}</a> or call us at {{support_phone}}.</p>
        
        <p>Thank you for choosing Phytronix!</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Password Reset Email
  passwordReset: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .reset-box { background-color: #f0f7ff; border-radius: 5px; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        .button { display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .warning { font-size: 12px; color: #777; font-style: italic; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Reset Your Password</h1>
        </div>
        
        <p>Hello,</p>
        
        <p>We received a request to reset your password for your Phytronix account. If you didn't make this request, you can ignore this email.</p>
        
        <div class="reset-box">
          <p>To reset your password, click the button below:</p>
          <a href="{{reset_link}}" class="button">Reset Password</a>
          <p class="warning">This link will expire in {{expiry_time}}.</p>
        </div>
        
        <p>If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
        <p style="word-break: break-all; font-size: 12px;">{{reset_link}}</p>
        
        <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:{{support_email}}">{{support_email}}</a>.</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Workshop Request Email
  workshopRequest: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workshop Request Confirmation</title>
      <style>
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f7f7f7; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 150px; height: auto; }
        .request-info { background-color: #f0f7ff; border-radius: 5px; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; font-size: 12px; color: #777; }
        @media only screen and (max-width: 600px) {
          .container { width: 100%; padding: 10px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://i.postimg.cc/sDjx6nv8/Logo-Phytronix.png" alt="Phytronix Logo" class="logo">
          <h1 style="color: #3b82f6;">Workshop Request Confirmation</h1>
        </div>
        
        <p>Dear {{contact_name}},</p>
        
        <p>Thank you for your interest in our workshop services. We've received your request for the "{{workshop_title}}" workshop.</p>
        
        <div class="request-info">
          <h3>Request Details</h3>
          <p><strong>Institution:</strong> {{institution_name}} ({{institution_type}})</p>
          <p><strong>Workshop:</strong> {{workshop_title}}</p>
          <p><strong>Preferred Dates:</strong> {{preferred_dates}}</p>
          <p><strong>Number of Participants:</strong> {{participants}}</p>
          <p><strong>Additional Requirements:</strong> {{additional_requirements}}</p>
          <p><strong>Request Date:</strong> {{request_date}}</p>
        </div>
        
        <p>Our team will review your request and get back to you within {{estimated_response_time}} to discuss the details and confirm availability.</p>
        
        <p>If you have any questions or need to update your request, please don't hesitate to contact our workshop coordination team at <a href="mailto:workshops@phytronix.com">workshops@phytronix.com</a> or call us at +91 9876 543 210.</p>
        
        <p>Thank you for considering Phytronix for your workshop needs!</p>
        
        <div class="footer">
          <p>&copy; {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
        </div>
      </div>
    </body>
    </html>
  `
};

export default emailTemplates;