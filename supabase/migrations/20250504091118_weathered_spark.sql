/*
  # Create e-commerce tables with proper RLS policies

  1. New Tables
    - `products` - Store product information
    - `orders` - Track customer orders
    - `order_items` - Track items within each order
  2. Security
    - Enable RLS on all tables
    - Set up proper policies for authenticated users
    - Allow public read access to products
    - Restrict order access to order owners
  3. Performance
    - Add indexes for common query patterns
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  discount_price numeric,
  image text,
  category text,
  tags text[],
  stock integer NOT NULL DEFAULT 0,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total numeric NOT NULL DEFAULT 0,
  shipping_address jsonb,
  payment_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders NOT NULL,
  product_id uuid REFERENCES products NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  UNIQUE(order_id, product_id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Admin users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "Users can view their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders o 
    WHERE o.id = order_items.order_id 
    AND o.user_id = auth.uid()
  ));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);