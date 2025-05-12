/*
  # Add demo orders for testing

  1. New Data
    - Insert demo orders with various statuses
    - Create order items linked to existing products
    - Add shipping addresses and payment details
  
  2. Demonstration
    - Create orders with different statuses (pending, processing, shipped, delivered, cancelled)
    - Associate orders with the admin user for easy testing
    - Include sample order items with varying quantities and prices
*/

-- Function to get a user ID (preferably admin) for demo orders
CREATE OR REPLACE FUNCTION get_admin_user_id() RETURNS uuid AS $$
DECLARE
  user_id uuid;
BEGIN
  -- First try to get a user with admin role from auth.users
  SELECT id INTO user_id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin' 
  LIMIT 1;
  
  -- If no admin found, just get any user
  IF user_id IS NULL THEN
    SELECT id INTO user_id FROM auth.users LIMIT 1;
  END IF;
  
  -- If still no user, create a placeholder UUID (shouldn't happen in real setup)
  IF user_id IS NULL THEN
    user_id := '00000000-0000-0000-0000-000000000000'::uuid;
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert demo orders
DO $$
DECLARE
  user_id uuid;
  order_id1 uuid;
  order_id2 uuid;
  order_id3 uuid;
  order_id4 uuid;
  order_id5 uuid;
  product_ids uuid[];
  product_id uuid;
  product_price numeric;
  random_quantity integer;
  total_amount1 numeric := 0;
  total_amount2 numeric := 0;
  total_amount3 numeric := 0;
  total_amount4 numeric := 0;
  total_amount5 numeric := 0;
BEGIN
  -- Get user ID
  user_id := get_admin_user_id();
  
  -- Get product IDs
  SELECT array_agg(id) INTO product_ids FROM products;
  
  -- Skip if no products exist
  IF array_length(product_ids, 1) IS NULL THEN
    RAISE NOTICE 'No products found, skipping demo order creation';
    RETURN;
  END IF;
  
  -- Create Order 1: Pending
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    user_id, 
    'pending', 
    '{"full_name": "John Doe", "street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "postal_code": "400001", "country": "India", "phone": "+918800112233"}', 
    '{"method": "cod", "status": "pending"}', 
    now() - interval '2 hours'
  ) RETURNING id INTO order_id1;
  
  -- Create Order 2: Processing
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    user_id, 
    'processing', 
    '{"full_name": "Rajesh Kumar", "street": "456 Park Avenue", "city": "Delhi", "state": "Delhi", "postal_code": "110001", "country": "India", "phone": "+919900112233"}', 
    '{"method": "cod", "status": "confirmed"}', 
    now() - interval '1 day'
  ) RETURNING id INTO order_id2;
  
  -- Create Order 3: Shipped
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    user_id, 
    'shipped', 
    '{"full_name": "Priya Singh", "street": "789 Lake Road", "city": "Bangalore", "state": "Karnataka", "postal_code": "560001", "country": "India", "phone": "+917700112233"}', 
    '{"method": "cod", "status": "confirmed"}', 
    now() - interval '3 days'
  ) RETURNING id INTO order_id3;
  
  -- Create Order 4: Delivered
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    user_id, 
    'delivered', 
    '{"full_name": "Amit Patel", "street": "234 Hill Avenue", "city": "Chennai", "state": "Tamil Nadu", "postal_code": "600001", "country": "India", "phone": "+916600112233"}', 
    '{"method": "cod", "status": "paid"}', 
    now() - interval '7 days'
  ) RETURNING id INTO order_id4;
  
  -- Create Order 5: Cancelled
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    user_id, 
    'cancelled', 
    '{"full_name": "Sneha Gupta", "street": "567 River Lane", "city": "Kolkata", "state": "West Bengal", "postal_code": "700001", "country": "India", "phone": "+915500112233"}', 
    '{"method": "cod", "status": "cancelled"}', 
    now() - interval '5 days'
  ) RETURNING id INTO order_id5;
  
  -- Add items to Order 1 (Pending)
  FOR i IN 1..2 LOOP
    -- Get a random product
    SELECT product_ids[1 + floor(random() * array_length(product_ids, 1))::int] INTO product_id;
    
    -- Get product price
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    
    -- Random quantity between 1 and 3
    random_quantity := 1 + floor(random() * 3)::int;
    
    -- Insert order item
    INSERT INTO order_items (
      order_id, 
      product_id, 
      quantity, 
      price
    ) VALUES (
      order_id1, 
      product_id, 
      random_quantity, 
      product_price
    );
    
    total_amount1 := total_amount1 + (product_price * random_quantity);
  END LOOP;
  
  -- Update order 1 total
  UPDATE orders SET total = total_amount1 WHERE id = order_id1;
  
  -- Add items to Order 2 (Processing)
  FOR i IN 1..3 LOOP
    SELECT product_ids[1 + floor(random() * array_length(product_ids, 1))::int] INTO product_id;
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id2, product_id, random_quantity, product_price);
    
    total_amount2 := total_amount2 + (product_price * random_quantity);
  END LOOP;
  
  UPDATE orders SET total = total_amount2 WHERE id = order_id2;
  
  -- Add items to Order 3 (Shipped)
  FOR i IN 1..1 LOOP
    SELECT product_ids[1 + floor(random() * array_length(product_ids, 1))::int] INTO product_id;
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id3, product_id, random_quantity, product_price);
    
    total_amount3 := total_amount3 + (product_price * random_quantity);
  END LOOP;
  
  UPDATE orders SET total = total_amount3 WHERE id = order_id3;
  
  -- Add items to Order 4 (Delivered)
  FOR i IN 1..4 LOOP
    SELECT product_ids[1 + floor(random() * array_length(product_ids, 1))::int] INTO product_id;
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id4, product_id, random_quantity, product_price);
    
    total_amount4 := total_amount4 + (product_price * random_quantity);
  END LOOP;
  
  UPDATE orders SET total = total_amount4 WHERE id = order_id4;
  
  -- Add items to Order 5 (Cancelled)
  FOR i IN 1..2 LOOP
    SELECT product_ids[1 + floor(random() * array_length(product_ids, 1))::int] INTO product_id;
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id5, product_id, random_quantity, product_price);
    
    total_amount5 := total_amount5 + (product_price * random_quantity);
  END LOOP;
  
  UPDATE orders SET total = total_amount5 WHERE id = order_id5;
  
  RAISE NOTICE 'Created 5 demo orders with items';
END;
$$;

-- Drop the temporary function
DROP FUNCTION get_admin_user_id();