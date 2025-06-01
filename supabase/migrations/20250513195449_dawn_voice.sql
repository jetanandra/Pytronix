/*
  # Order Cancellation and Replacement System

  1. New Tables
    - `order_cancellation_requests`
      - `id` (uuid, primary key)
      - `order_id` (uuid, FK to orders)
      - `user_id` (uuid, FK to profiles)
      - `type` (text - 'cancel' or 'exchange')
      - `reason` (text)
      - `status` (text - 'pending', 'approved', 'rejected') 
      - `admin_response` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS (Row Level Security)
    - Create policies for managing requests
  
  3. Indexes
    - Add indexes for better query performance
*/

-- Create the order_cancellation_requests table
CREATE TABLE IF NOT EXISTS order_cancellation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('cancel', 'exchange')),
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_order_cancellation_requests_order_id ON order_cancellation_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_order_cancellation_requests_user_id ON order_cancellation_requests(user_id);

-- Enable RLS
ALTER TABLE order_cancellation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own cancellation requests
CREATE POLICY "Users can view their own cancellation requests"
  ON order_cancellation_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create cancellation requests for their own orders
CREATE POLICY "Users can create cancellation requests"
  ON order_cancellation_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Users can update their own cancellation requests if they're still pending
CREATE POLICY "Users can update their pending cancellation requests"
  ON order_cancellation_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND 
    status = 'pending'
  )
  WITH CHECK (
    auth.uid() = user_id AND 
    status = 'pending'
  );

-- Admins can view all cancellation requests
CREATE POLICY "Admins can view all cancellation requests"
  ON order_cancellation_requests
  FOR SELECT
  TO authenticated
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Admins can update any cancellation request
CREATE POLICY "Admins can update cancellation requests"
  ON order_cancellation_requests
  FOR UPDATE
  TO authenticated
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Update trigger for updated_at
CREATE TRIGGER update_order_cancellation_requests_modtime
  BEFORE UPDATE ON order_cancellation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();