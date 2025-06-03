// Email templates for the Phytronix e-commerce platform
// These templates are used with EmailJS service

export const emailTemplates = {
  // Order Confirmation Email
  orderConfirmation: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #3b82f6;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .order-details {
          background-color: #f8fafc;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .order-summary {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .order-summary th {
          background-color: #e8f0fe;
          text-align: left;
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        .order-summary td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        .total-row {
          font-weight: bold;
          background-color: #f3f6fb;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        .address-box {
          background-color: #f3f6fb;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Order Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
          
          <div class="order-details">
            <p><strong>Order Number:</strong> #{{order_id}}</p>
            <p><strong>Order Date:</strong> {{order_date}}</p>
            <p><strong>Payment Method:</strong> {{payment_method}}</p>
            <p><strong>Order Status:</strong> {{order_status}}</p>
          </div>
          
          <h2>Order Summary</h2>
          <table class="order-summary">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {{#each order_items}}
              <tr>
                <td>{{name}}</td>
                <td>{{quantity}}</td>
                <td>₹{{price}}</td>
              </tr>
              {{/each}}
              <tr class="total-row">
                <td colspan="2">Total</td>
                <td>{{order_total}}</td>
              </tr>
            </tbody>
          </table>
          
          <h2>Shipping Information</h2>
          <div class="address-box">
            <p>{{shipping_address}}</p>
          </div>
          
          <p>Your order is estimated to arrive by <strong>{{estimated_delivery}}</strong>.</p>
          
          <p>You can track your order status by clicking the button below:</p>
          
          <a href="{{order_link}}" class="button">Track Your Order</a>
          
          <p>If you have any questions or concerns about your order, please don't hesitate to contact our customer service team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for shopping with Phytronix!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #22c55e;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #22c55e;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .payment-details {
          background-color: #f0fdf4;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #22c55e;
        }
        .button {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #16a34a;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Payment Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>Thank you for your payment! We're pleased to confirm that your payment for order #{{order_id}} has been successfully processed.</p>
          
          <div class="payment-details">
            <p><strong>Payment ID:</strong> {{payment_id}}</p>
            <p><strong>Payment Date:</strong> {{payment_date}}</p>
            <p><strong>Payment Method:</strong> {{payment_method}}</p>
            <p><strong>Amount Paid:</strong> {{payment_amount}}</p>
          </div>
          
          <p>Your order is now being processed and will be shipped soon. You'll receive another email with shipping details once your order is on its way.</p>
          
          <p>You can view your order details by clicking the button below:</p>
          
          <a href="{{order_link}}" class="button">View Order Details</a>
          
          <p>If you have any questions or concerns about your payment, please don't hesitate to contact our customer service team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for shopping with Phytronix!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
      <title>Order Shipped</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #8b5cf6;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #8b5cf6;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .tracking-details {
          background-color: #f5f3ff;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #8b5cf6;
        }
        .button {
          display: inline-block;
          background-color: #8b5cf6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #7c3aed;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        .shipping-progress {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
          position: relative;
        }
        .shipping-progress:before {
          content: '';
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #e5e7eb;
          z-index: 1;
        }
        .progress-step {
          position: relative;
          z-index: 2;
          text-align: center;
          width: 25%;
        }
        .step-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .step-icon.active {
          background-color: #8b5cf6;
          color: white;
        }
        .step-label {
          font-size: 12px;
          color: #6b7280;
        }
        .step-label.active {
          color: #8b5cf6;
          font-weight: bold;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
          .shipping-progress {
            flex-wrap: wrap;
          }
          .progress-step {
            width: 50%;
            margin-bottom: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Your Order Has Shipped!</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>Great news! Your order #{{order_id}} is on its way to you.</p>
          
          <div class="shipping-progress">
            <div class="progress-step">
              <div class="step-icon active">✓</div>
              <div class="step-label active">Order Placed</div>
            </div>
            <div class="progress-step">
              <div class="step-icon active">✓</div>
              <div class="step-label active">Processing</div>
            </div>
            <div class="progress-step">
              <div class="step-icon active">✓</div>
              <div class="step-label active">Shipped</div>
            </div>
            <div class="progress-step">
              <div class="step-icon">✓</div>
              <div class="step-label">Delivered</div>
            </div>
          </div>
          
          <div class="tracking-details">
            <h2>Tracking Information</h2>
            <p><strong>Tracking Number:</strong> {{tracking_id}}</p>
            <p><strong>Carrier:</strong> {{shipping_carrier}}</p>
            {{#if tracking_url}}
            <p><a href="{{tracking_url}}" class="button">Track Your Package</a></p>
            {{/if}}
          </div>
          
          <p>Your package is expected to arrive within 5-7 business days. You'll receive another notification when your order has been delivered.</p>
          
          <p>You can also view your order details and tracking information by clicking the button below:</p>
          
          <a href="{{order_link}}" class="button">View Order Details</a>
          
          <p>If you have any questions or concerns about your shipment, please don't hesitate to contact our customer service team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for shopping with Phytronix!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
      <title>Order Delivered</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #22c55e;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #22c55e;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .delivery-details {
          background-color: #f0fdf4;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #22c55e;
        }
        .button {
          display: inline-block;
          background-color: #22c55e;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #16a34a;
        }
        .button.secondary {
          background-color: #3b82f6;
        }
        .button.secondary:hover {
          background-color: #2563eb;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        .shipping-progress {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
          position: relative;
        }
        .shipping-progress:before {
          content: '';
          position: absolute;
          top: 15px;
          left: 0;
          right: 0;
          height: 4px;
          background-color: #22c55e;
          z-index: 1;
        }
        .progress-step {
          position: relative;
          z-index: 2;
          text-align: center;
          width: 25%;
        }
        .step-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #22c55e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .step-label {
          font-size: 12px;
          color: #22c55e;
          font-weight: bold;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
          .shipping-progress {
            flex-wrap: wrap;
          }
          .progress-step {
            width: 50%;
            margin-bottom: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Your Order Has Been Delivered!</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>Great news! Your order #{{order_id}} has been delivered.</p>
          
          <div class="shipping-progress">
            <div class="progress-step">
              <div class="step-icon">✓</div>
              <div class="step-label">Order Placed</div>
            </div>
            <div class="progress-step">
              <div class="step-icon">✓</div>
              <div class="step-label">Processing</div>
            </div>
            <div class="progress-step">
              <div class="step-icon">✓</div>
              <div class="step-label">Shipped</div>
            </div>
            <div class="progress-step">
              <div class="step-icon">✓</div>
              <div class="step-label">Delivered</div>
            </div>
          </div>
          
          <div class="delivery-details">
            <h2>Delivery Information</h2>
            <p><strong>Delivery Date:</strong> {{delivery_date}}</p>
            <p><strong>Delivery Address:</strong> {{shipping_address}}</p>
          </div>
          
          <p>We hope you enjoy your purchase! If you have any questions or need assistance with your order, please don't hesitate to contact our customer service team.</p>
          
          <p>You can view your order details by clicking the button below:</p>
          
          <a href="{{order_link}}" class="button">View Order Details</a>
          
          <h2>What's Next?</h2>
          
          <p>We'd love to hear about your experience with our products. Please take a moment to leave a review by clicking the button below:</p>
          
          <a href="{{review_link}}" class="button secondary">Write a Review</a>
          
          <p>If you have any questions or concerns about your delivery, please don't hesitate to contact our customer service team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for shopping with Phytronix!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
      <title>Order Cancelled</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #ef4444;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #ef4444;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .cancellation-details {
          background-color: #fef2f2;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #ef4444;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Order Cancelled</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>We're writing to confirm that your order #{{order_id}} has been cancelled as requested.</p>
          
          <div class="cancellation-details">
            <h2>Cancellation Details</h2>
            <p><strong>Order Number:</strong> #{{order_id}}</p>
            <p><strong>Order Date:</strong> {{order_date}}</p>
            <p><strong>Cancellation Date:</strong> {{cancellation_date}}</p>
            {{#if cancellation_reason}}
            <p><strong>Reason for Cancellation:</strong> {{cancellation_reason}}</p>
            {{/if}}
          </div>
          
          <h2>Refund Information</h2>
          
          <p>{{refund_message}}</p>
          
          <p>You can view your order details by clicking the button below:</p>
          
          <a href="{{order_link}}" class="button">View Order Details</a>
          
          <p>We're sorry that you had to cancel your order. If there's anything we can do to improve your experience or if you need assistance with a new order, please don't hesitate to contact our customer service team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for considering Phytronix. We hope to serve you better in the future.</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #3b82f6;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .cart-items {
          background-color: #f3f6fb;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .cart-item {
          display: flex;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .cart-item:last-child {
          border-bottom: none;
        }
        .item-image {
          width: 60px;
          height: 60px;
          object-fit: contain;
          margin-right: 15px;
          background-color: #f8fafc;
          border-radius: 5px;
        }
        .item-details {
          flex-grow: 1;
        }
        .item-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .item-price {
          color: #3b82f6;
        }
        .cart-total {
          text-align: right;
          font-weight: bold;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .expiry-notice {
          background-color: #fffbeb;
          padding: 10px;
          border-radius: 5px;
          margin: 15px 0;
          font-size: 14px;
          border-left: 4px solid #f59e0b;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
          .cart-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .item-image {
            margin-bottom: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Your Cart is Waiting!</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>We noticed that you left some items in your shopping cart. Don't worry, we've saved them for you!</p>
          
          <div class="cart-items">
            <h2>Your Cart Items</h2>
            
            {{#each cart_items}}
            <div class="cart-item">
              <img src="{{image}}" alt="{{name}}" class="item-image">
              <div class="item-details">
                <div class="item-name">{{name}}</div>
                <div class="item-quantity">Quantity: {{quantity}}</div>
                <div class="item-price">₹{{price}}</div>
              </div>
            </div>
            {{/each}}
            
            <div class="cart-total">
              Total: {{cart_total}}
            </div>
          </div>
          
          <div class="expiry-notice">
            <p><strong>Note:</strong> Your cart will be saved for {{expiry_time}} from now. Complete your purchase before your cart expires!</p>
          </div>
          
          <p>Ready to complete your purchase? Click the button below to return to your cart:</p>
          
          <a href="{{cart_link}}" class="button">Complete Your Purchase</a>
          
          <h2>Need Help?</h2>
          
          <p>If you have any questions about the items in your cart or need assistance with your purchase, our customer service team is here to help. Contact us at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for considering Phytronix for your electronics needs!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #3b82f6;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .order-details {
          background-color: #f3f6fb;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .button.secondary {
          background-color: #22c55e;
        }
        .button.secondary:hover {
          background-color: #16a34a;
        }
        .rating-stars {
          text-align: center;
          margin: 20px 0;
        }
        .rating-stars a {
          display: inline-block;
          margin: 0 5px;
          text-decoration: none;
          font-size: 30px;
          color: #f59e0b;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>How Was Your Experience?</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>Thank you for your recent purchase from Phytronix! We hope you're enjoying your new products.</p>
          
          <div class="order-details">
            <p><strong>Order Number:</strong> #{{order_id}}</p>
            <p><strong>Order Date:</strong> {{order_date}}</p>
          </div>
          
          <p>We'd love to hear about your experience with both our products and service. Your feedback helps us improve and better serve customers like you.</p>
          
          <h2>How would you rate your overall experience?</h2>
          
          <div class="rating-stars">
            <a href="{{feedback_link}}?rating=1">★</a>
            <a href="{{feedback_link}}?rating=2">★</a>
            <a href="{{feedback_link}}?rating=3">★</a>
            <a href="{{feedback_link}}?rating=4">★</a>
            <a href="{{feedback_link}}?rating=5">★</a>
          </div>
          
          <p>Or click the button below to share your detailed feedback:</p>
          
          <a href="{{feedback_link}}" class="button">Share Your Feedback</a>
          
          <h2>Write a Product Review</h2>
          
          <p>Your reviews help other customers make informed decisions. Please consider writing a review for the products you purchased:</p>
          
          <a href="{{review_link}}" class="button secondary">Write a Review</a>
          
          <p>If you have any questions or need assistance with your purchase, please don't hesitate to contact our customer service team at <a href="mailto:support@phytronix.com">support@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for choosing Phytronix!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #3b82f6;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .feature-box {
          background-color: #f3f6fb;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          display: flex;
          align-items: center;
        }
        .feature-icon {
          width: 50px;
          height: 50px;
          background-color: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          color: white;
          font-size: 24px;
        }
        .feature-text {
          flex-grow: 1;
        }
        .feature-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
          .feature-box {
            flex-direction: column;
            text-align: center;
          }
          .feature-icon {
            margin: 0 0 10px 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Welcome to Phytronix!</h1>
        </div>
        
        <div class="content">
          <p>Hello {{customer_name}},</p>
          
          <p>Thank you for creating an account with Phytronix! We're excited to have you join our community of engineers, hobbyists, and makers.</p>
          
          <p>Your account is now active and ready to use. Here's what you can do with your Phytronix account:</p>
          
          <div class="feature-box">
            <div class="feature-icon">🛒</div>
            <div class="feature-text">
              <div class="feature-title">Shop with Ease</div>
              <p>Browse our extensive collection of electronics and IoT components, save items to your wishlist, and enjoy a seamless checkout experience.</p>
            </div>
          </div>
          
          <div class="feature-box">
            <div class="feature-icon">📦</div>
            <div class="feature-text">
              <div class="feature-title">Track Your Orders</div>
              <p>Keep tabs on your purchases from order confirmation to delivery with real-time tracking updates.</p>
            </div>
          </div>
          
          <div class="feature-box">
            <div class="feature-icon">🔧</div>
            <div class="feature-text">
              <div class="feature-title">Access Workshops</div>
              <p>Register for our hands-on technology workshops and enhance your skills with guidance from industry experts.</p>
            </div>
          </div>
          
          <div class="feature-box">
            <div class="feature-icon">💬</div>
            <div class="feature-text">
              <div class="feature-title">Join the Community</div>
              <p>Share your experiences, write product reviews, and connect with fellow tech enthusiasts.</p>
            </div>
          </div>
          
          <p>Ready to start exploring? Click the button below to browse our products:</p>
          
          <a href="{{products_link}}" class="button">Explore Products</a>
          
          <h2>Need Help?</h2>
          
          <p>If you have any questions or need assistance, our customer service team is here to help. Contact us at <a href="mailto:{{support_email}}">{{support_email}}</a> or call us at {{support_phone}}.</p>
          
          <p>Thank you for choosing Phytronix. We look forward to being part of your tech journey!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
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
      <title>Password Reset</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #3b82f6;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #3b82f6;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .reset-box {
          background-color: #f3f6fb;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
        }
        .button {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
          font-size: 16px;
        }
        .button:hover {
          background-color: #2563eb;
        }
        .security-notice {
          background-color: #fffbeb;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          font-size: 14px;
          border-left: 4px solid #f59e0b;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Password Reset</h1>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          
          <p>We received a request to reset the password for your Phytronix account. If you didn't make this request, you can safely ignore this email.</p>
          
          <div class="reset-box">
            <p>To reset your password, click the button below:</p>
            
            <a href="{{reset_link}}" class="button">Reset Password</a>
            
            <p>This link will expire in {{expiry_time}}.</p>
          </div>
          
          <div class="security-notice">
            <p><strong>Security Notice:</strong> If you didn't request a password reset, please contact our support team immediately at <a href="mailto:{{support_email}}">{{support_email}}</a>.</p>
          </div>
          
          <p>If the button above doesn't work, you can copy and paste the following URL into your browser:</p>
          
          <p style="word-break: break-all; font-size: 12px; color: #666;">{{reset_link}}</p>
          
          <p>Thank you for using Phytronix!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Workshop Request Confirmation Email
  workshopRequest: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Workshop Request Confirmation</title>
      <style>
        /* Base styles */
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f7f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 2px solid #8b5cf6;
        }
        .logo {
          max-width: 150px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px 0;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #eee;
        }
        h1 {
          color: #8b5cf6;
          font-family: 'Orbitron', Arial, sans-serif;
          margin-bottom: 20px;
        }
        h2 {
          color: #1e293b;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
        }
        p {
          margin: 10px 0;
        }
        .request-details {
          background-color: #f5f3ff;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #8b5cf6;
        }
        .button {
          display: inline-block;
          background-color: #8b5cf6;
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background-color: #7c3aed;
        }
        .next-steps {
          background-color: #f3f6fb;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .next-steps ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        .next-steps li {
          margin-bottom: 10px;
        }
        .social-links {
          margin-top: 20px;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          text-decoration: none;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
          .container {
            width: 100%;
            padding: 10px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{company_logo}}" alt="Phytronix" class="logo">
          <h1>Workshop Request Confirmation</h1>
        </div>
        
        <div class="content">
          <p>Hello {{contact_name}},</p>
          
          <p>Thank you for your interest in our workshop program! We've received your request for the <strong>{{workshop_title}}</strong> workshop for {{institution_name}}.</p>
          
          <div class="request-details">
            <h2>Request Details</h2>
            <p><strong>Institution:</strong> {{institution_name}} ({{institution_type}})</p>
            <p><strong>Workshop:</strong> {{workshop_title}}</p>
            <p><strong>Preferred Dates:</strong> {{preferred_dates}}</p>
            <p><strong>Number of Participants:</strong> {{participants}}</p>
            <p><strong>Additional Requirements:</strong> {{additional_requirements}}</p>
            <p><strong>Request Date:</strong> {{request_date}}</p>
          </div>
          
          <div class="next-steps">
            <h2>What Happens Next?</h2>
            <ol>
              <li>Our team will review your workshop request within {{estimated_response_time}}.</li>
              <li>We'll check the availability of our instructors for your preferred dates.</li>
              <li>We'll contact you to discuss any specific requirements and confirm the details.</li>
              <li>Once confirmed, we'll send you a formal confirmation email with all the workshop details.</li>
            </ol>
          </div>
          
          <p>If you have any questions or need to update your request, please don't hesitate to contact our workshop coordination team at <a href="mailto:workshops@phytronix.com">workshops@phytronix.com</a> or call us at +91 9876 543 210.</p>
          
          <p>Thank you for choosing Phytronix for your educational needs!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="https://facebook.com/phytronix">Facebook</a> |
            <a href="https://twitter.com/phytronix">Twitter</a> |
            <a href="https://instagram.com/phytronix">Instagram</a>
          </div>
          <p>© {{current_year}} Phytronix. All rights reserved.</p>
          <p>Nakari-2, Glob House, Phytronix, North Lakhimpur 787001, India</p>
          <p>
            <a href="{{website_url}}/privacy">Privacy Policy</a> |
            <a href="{{website_url}}/terms">Terms & Conditions</a> |
            <a href="{{website_url}}/unsubscribe?email={{to_email}}">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
};

export default emailTemplates;