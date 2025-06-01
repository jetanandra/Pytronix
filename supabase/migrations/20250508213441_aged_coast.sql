/*
  # Fix Orders RLS Policies

  1. Changes
    - Update user insert policy to correctly handle authenticated users
    - Ensure RLS policies allow authenticated users to create and view their orders
    - Fix authentication checks

  2. Security
    - Maintain security by ensuring users can only manage their own orders
    - Authenticated users can create orders
*/

-- First, drop any problematic policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;

-- Create updated policy for order insertion
CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure orders RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create a policy for updating orders
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a policy for selecting orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add admin policies for orders
CREATE POLICY "Admins can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Add an index on user_id if it doesn't exist already
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);