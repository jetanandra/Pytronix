/*
  # Add Tracking Information to Orders table

  1. Changes
    - Add tracking_id field to store carrier's tracking number
    - Add tracking_url field to store direct link to tracking page
    - Add shipping_carrier field to store name of shipping company
  
  2. Purpose
    - Allow admins to add tracking information when shipping orders
    - Enable customers to track their packages from order details
*/

-- Add tracking fields to orders table
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS tracking_id TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;