/*
  # Add new payment fields to orders table

  1. Changes
    - Add columns for integrating with Razorpay payment gateway:
      - payment_provider
      - payment_redirect_url
      - razorpay_order_id
      - razorpay_payment_id
    
  2. Utility
    - These fields allow tracking the payment gateway used
    - Store important IDs and URLs for reference and tracking
    - Enable better order fulfillment and payment verification
*/

-- Add payment gateway fields to orders table
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(32),
ADD COLUMN IF NOT EXISTS payment_redirect_url TEXT,
ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;