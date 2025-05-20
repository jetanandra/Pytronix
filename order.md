# Order Processing & Razorpay Integration

This document provides a comprehensive overview of the order processing system and Razorpay payment integration in the Phytronix e-commerce platform. It's designed to help new developers understand the workflow, components, and how to maintain or extend the system.

## Table of Contents

1. [Order System Overview](#order-system-overview)
2. [Database Schema](#database-schema)
3. [Order Workflow](#order-workflow)
4. [Razorpay Integration](#razorpay-integration)
5. [Edge Functions](#edge-functions)
6. [Moving to Production](#moving-to-production)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Order System Overview

The Phytronix order system is a complete end-to-end solution that manages the lifecycle of customer orders from cart checkout through payment processing to order fulfillment. It supports two payment methods:

1. Cash on Delivery (COD)
2. Online Payment via Razorpay

The system is built on a React frontend with Supabase as the backend, utilizing Edge Functions for secure payment processing.

### Key Features

- **Multi-payment Method Support**: Razorpay integration and Cash on Delivery options
- **Order Status Tracking**: Orders progress through various statuses (pending, processing, shipped, delivered, or cancelled)
- **Admin Order Management**: Special interfaces for admins to manage orders
- **Real-time Order Updates**: Using Supabase's real-time capabilities

### Core Components

1. **Checkout Page**: Handles order creation and payment initiation
2. **Order Service**: API functions that interact with the Supabase database
3. **Payment Service**: Handles Razorpay integration
4. **Edge Functions**: Serverless functions for payment operations that require API keys

## Database Schema

The order data is stored across multiple tables in the Supabase PostgreSQL database:

### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL DEFAULT 0,
  shipping_address JSONB,
  payment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  payment_provider VARCHAR(32),
  payment_redirect_url TEXT,
  tracking_id TEXT,
  tracking_url TEXT,
  shipping_carrier TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  UNIQUE(order_id, product_id)
);
```

### Row-Level Security (RLS)

The order tables have RLS policies that:

1. Allow users to view and update their own orders
2. Allow admins to view and update all orders
3. Prevent unauthorized access to order data

## Order Workflow

### 1. Cart to Checkout

1. User adds products to cart (stored in localStorage)
2. User navigates to checkout page
3. User selects/adds shipping address and payment method

### 2. Order Creation

When a user places an order:

```javascript
// Creating an order
const orderDetails = {
  user_id: user.id,
  total: cart.total,
  shipping_address: {
    full_name: formState.name,
    ...selectedAddress
  },
  payment_details: {
    method: formState.paymentMethod,
    status: 'pending'
  },
  status: 'pending'
};

const { id } = await createOrder(orderDetails);
```

### 3. Payment Processing

#### Cash on Delivery (COD)
- Order is marked as 'pending'
- User is redirected to order confirmation screen

#### Razorpay Payment
1. Razorpay order is created through Edge Function
2. Razorpay checkout modal is displayed to the user
3. User completes payment
4. Payment is verified
5. Order status is updated to 'processing'

### 4. Order Fulfillment (Admin Flow)

Admins can update order status through the admin interface:

1. **Processing**: Order is being prepared
2. **Shipped**: Order has been shipped (tracking details added)
3. **Delivered**: Order has been delivered to the customer
4. **Cancelled**: Order has been cancelled

## Razorpay Integration

The Phytronix platform integrates with Razorpay to process online payments securely. The integration has been architected to ensure security by handling sensitive operations in Edge Functions rather than exposing API keys in the frontend.

### Integration Architecture

```
User ↔ Frontend (React) ↔ Supabase Edge Functions ↔ Razorpay API ↔ Razorpay Webhook ↔ Supabase Database
```

### Key Components

1. **Frontend Component**: `RazorpayCheckout.tsx`
2. **Payment Service**: `paymentService.ts`
3. **Edge Functions**:
   - `razorpay-create-order`: Creates a new order in Razorpay
   - `razorpay-verify-payment`: Verifies payment status
   - `razorpay-webhook`: Handles Razorpay webhook events

### Configuration

Currently, the app is configured in test mode with the following test credentials:

```
RAZORPAY_KEY_ID=rzp_test_89CCL7nHE71FCf
RAZORPAY_KEY_SECRET=w8OhmDRlhg5iaf7Bg1bgQVUX
RAZORPAY_WEBHOOK_SECRET=Debanga@91
VITE_RAZORPAY_KEY_ID=rzp_test_89CCL7nHE71FCf
```

### Payment Flow

1. **Create Order**:
   - The `createRazorpayOrder` function calls the `razorpay-create-order` Edge Function
   - This creates an order in Razorpay's system
   - Returns a Razorpay order ID

2. **Process Payment**:
   - The Razorpay checkout is shown to the user
   - User enters payment details
   - Payment is processed by Razorpay
   - Razorpay returns a payment ID

3. **Verify Payment**:
   - `verifyRazorpayPayment` function updates the order in Supabase
   - This can be backed by a webhook for production use

4. **Handle Payment Response**:
   - On successful payment, user is redirected to order confirmation
   - On failed payment, appropriate error message is shown

### Razorpay SDK Implementation

The Razorpay checkout implementation:

```javascript
// Options for Razorpay checkout
const options = {
  key: razorpayKeyId,
  amount: Number(order.total) * 100, // converting to paise
  currency: 'INR',
  name: 'Phytronix Electronics',
  description: `Order #${order.id.substring(0, 8)}...`,
  order_id: razorpayOrderId,
  handler: async function(response) {
    // Handle successful payment
    const success = await verifyRazorpayPayment(
      response.razorpay_payment_id,
      order.id
    );
    // Process order completion
  },
  prefill: {
    name: customerName,
    email: customerEmail,
    contact: customerPhone
  },
  theme: {
    color: '#3b82f6'  // neon-blue color
  }
};

// Initialize and open Razorpay checkout
const rzp = new window.Razorpay(options);
rzp.open();
```

## Edge Functions

Edge Functions are serverless functions hosted by Supabase that handle operations requiring secret API keys or server-side logic.

### razorpay-create-order

This function creates a Razorpay order. It:

1. Authenticates the user
2. Validates the request
3. Creates an order with Razorpay using their API
4. Updates the order in Supabase with Razorpay order details

```javascript
// Example request body
{
  "orderId": "uuid-of-order",
  "amount": 1499.99 // in rupees
}
```

### razorpay-verify-payment

This function verifies a payment after completion. It:

1. Authenticates the user
2. Validates the request
3. Updates the order in Supabase with payment status

```javascript
// Example request body
{
  "orderId": "uuid-of-order",
  "razorpayOrderId": "razorpay-order-id",
  "razorpayPaymentId": "razorpay-payment-id"
}
```

### razorpay-webhook

This function handles webhooks from Razorpay for asynchronous payment updates. It:

1. Verifies the signature of the webhook
2. Processes the event type
3. Updates order status in the database

## Moving to Production

To move the Razorpay integration from test mode to production (live mode), follow these steps:

### 1. Razorpay Account Setup

1. Create a live Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Complete the KYC process
3. Obtain your live API credentials (key ID and secret)

### 2. Update Environment Variables

Replace test credentials with live credentials:

1. In the Supabase Dashboard, update the following environment variables for your Edge Functions:
   - `RAZORPAY_KEY_ID`: Your live Razorpay key ID
   - `RAZORPAY_KEY_SECRET`: Your live Razorpay key secret
   - `RAZORPAY_WEBHOOK_SECRET`: Your live webhook secret

2. In your frontend `.env` file, update:
   - `VITE_RAZORPAY_KEY_ID`: Your live Razorpay key ID

### 3. Set Up Live Webhooks

1. In the Razorpay Dashboard, navigate to Settings > Webhooks
2. Add a new webhook with your production endpoint:
   ```
   https://[your-supabase-project].supabase.co/functions/v1/razorpay-webhook
   ```
3. Set up the webhook secret and select the events:
   - `payment.authorized`
   - `payment.failed`
   - `payment.captured`
   - `refund.created`

### 4. Update Success and Failure URLs

In `RazorpayCheckout.tsx`, update the redirect URLs if necessary to match your production domain.

### 5. Code Changes Required

The following code changes may be necessary:

1. In Razorpay modal options, update the `name` and `image` parameters to your production values:

```javascript
// In RazorpayCheckout.tsx
const options = {
  // ...
  name: "Your Production Company Name",
  image: "https://your-production-domain.com/logo.png",
  // ...
};
```

2. Consider implementing more robust error handling for production:

```javascript
// Enhanced error handling
try {
  // Payment processing
} catch (error) {
  // Log to error monitoring service
  errorMonitoringService.logError(error);
  // More specific error messages based on error types
}
```

3. Ensure webhook handling is fully implemented (currently only basic implementation exists).

### 6. Testing Live Integration

Before fully launching:

1. Use Razorpay's test cards in live mode (they have special cards for this purpose)
2. Test the complete order flow
3. Verify webhook events are being received correctly
4. Test refund processing

## Troubleshooting

### Common Payment Issues

#### Authentication Errors

If you see "Auth session missing!" errors:

1. Check that the user's session is valid
2. Ensure `supabase.auth.getSession()` is being called correctly
3. Verify authentication headers are being passed to Edge Functions

```javascript
// Correct way to include auth headers
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/razorpay-create-order`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload)
  }
);
```

#### Payment Verification Failures

If payment verifications fail:

1. Check Edge Function logs for detailed error messages
2. Verify the order exists and has the correct user_id
3. Ensure Razorpay order IDs match between database and Razorpay responses

#### CORS Errors

If you encounter CORS errors:

1. Verify the Edge Function includes proper CORS headers
2. Check browser console for specific CORS error messages

### Debugging Tools

1. **Edge Function Logs**: Check Supabase Dashboard > Edge Functions > Logs
2. **Razorpay Dashboard**: Review payment status in the Razorpay dashboard
3. **Browser Console**: Look for network errors during payment flow
4. **Supabase Database**: Directly query the orders table to check status

## Best Practices

### Security

1. **Never expose Razorpay secret keys** in frontend code
2. **Always verify payment server-side** (in Edge Functions)
3. **Validate ownership** of orders before processing payments
4. **Implement webhook signature verification** for production

### Error Handling

1. **Provide clear error messages** to users
2. **Log detailed errors** for debugging
3. **Gracefully handle failed payments** with retry options
4. **Implement timeout and network error handling**

### Order Management

1. **Implement automated status emails** for order updates
2. **Create a reconciliation process** to catch payment/order mismatches
3. **Set up monitoring** for failed orders
4. **Regularly backup order data**

### Testing

1. **Use Razorpay test cards** for different scenarios
2. **Test all payment failure cases**
3. **Test webhook handling** using Razorpay's test events
4. **Create end-to-end tests** for the complete order flow

## Conclusion

The Phytronix order system with Razorpay integration provides a secure and efficient way to handle customer orders and payments. By following this documentation, new developers should be able to understand, maintain, and extend the system as needed.

For additional questions or issues, refer to:
1. [Razorpay API Documentation](https://razorpay.com/docs/api/)
2. [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
3. [Phytronix Internal Docs](./documentation.md)