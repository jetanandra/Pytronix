/*
  # Add demo orders for testing

  1. New Data
    - Creates 5 demo orders with different statuses
    - Adds order items to each order
    - Uses specific admin and user IDs
    - Calculates correct order totals
  2. Changes
    - Prevents duplicate product entries in the same order
    - Sets realistic shipping addresses for each order
*/

-- Insert demo orders with specific user IDs
DO $$
DECLARE
  admin_user_id uuid := '41abfdd8-9226-45f0-847d-1a65ae9574f8';
  regular_user_id uuid := '98974a7a-7308-4c1a-b59f-93bde6de6b27';
  order_id1 uuid;
  order_id2 uuid;
  order_id3 uuid;
  order_id4 uuid;
  order_id5 uuid;
  product_ids uuid[];
  available_products uuid[];
  product_id uuid;
  product_price numeric;
  random_quantity integer;
  total_amount1 numeric := 0;
  total_amount2 numeric := 0;
  total_amount3 numeric := 0;
  total_amount4 numeric := 0;
  total_amount5 numeric := 0;
  product_index integer;
BEGIN
  -- Get product IDs for order items
  SELECT array_agg(id) INTO product_ids FROM products;
  
  -- Skip if no products exist
  IF array_length(product_ids, 1) IS NULL OR array_length(product_ids, 1) = 0 THEN
    RAISE NOTICE 'No products found, skipping demo order creation';
    RETURN;
  END IF;
  
  -- Create Order 1: Pending (for admin user)
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    admin_user_id, 
    'pending', 
    '{"full_name": "John Doe", "street": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "postal_code": "400001", "country": "India", "phone": "+918800112233"}', 
    '{"method": "cod", "status": "pending"}', 
    now() - interval '2 hours'
  ) RETURNING id INTO order_id1;
  
  -- Create Order 2: Processing (for regular user)
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    regular_user_id, 
    'processing', 
    '{"full_name": "Rajesh Kumar", "street": "456 Park Avenue", "city": "Delhi", "state": "Delhi", "postal_code": "110001", "country": "India", "phone": "+919900112233"}', 
    '{"method": "cod", "status": "confirmed"}', 
    now() - interval '1 day'
  ) RETURNING id INTO order_id2;
  
  -- Create Order 3: Shipped (for admin user)
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    admin_user_id, 
    'shipped', 
    '{"full_name": "Priya Singh", "street": "789 Lake Road", "city": "Bangalore", "state": "Karnataka", "postal_code": "560001", "country": "India", "phone": "+917700112233"}', 
    '{"method": "cod", "status": "confirmed"}', 
    now() - interval '3 days'
  ) RETURNING id INTO order_id3;
  
  -- Create Order 4: Delivered (for regular user)
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    regular_user_id, 
    'delivered', 
    '{"full_name": "Amit Patel", "street": "234 Hill Avenue", "city": "Chennai", "state": "Tamil Nadu", "postal_code": "600001", "country": "India", "phone": "+916600112233"}', 
    '{"method": "cod", "status": "paid"}', 
    now() - interval '7 days'
  ) RETURNING id INTO order_id4;
  
  -- Create Order 5: Cancelled (for admin user)
  INSERT INTO orders (
    id, 
    user_id, 
    status, 
    shipping_address, 
    payment_details, 
    created_at
  ) VALUES (
    gen_random_uuid(), 
    admin_user_id, 
    'cancelled', 
    '{"full_name": "Sneha Gupta", "street": "567 River Lane", "city": "Kolkata", "state": "West Bengal", "postal_code": "700001", "country": "India", "phone": "+915500112233"}', 
    '{"method": "cod", "status": "cancelled"}', 
    now() - interval '5 days'
  ) RETURNING id INTO order_id5;
  
  -- Add items to Order 1 (Pending)
  available_products := product_ids;
  FOR i IN 1..2 LOOP
    -- Exit if we've used all available products
    EXIT WHEN array_length(available_products, 1) < 1;
    
    -- Get a random product from the available ones
    product_index := 1 + floor(random() * array_length(available_products, 1))::int;
    product_id := available_products[product_index];
    
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
    
    -- Remove this product from available products to avoid duplicates
    SELECT array_remove(available_products, product_id) INTO available_products;
  END LOOP;
  
  -- Update order 1 total
  UPDATE orders SET total = total_amount1 WHERE id = order_id1;
  
  -- Add items to Order 2 (Processing)
  available_products := product_ids;
  FOR i IN 1..3 LOOP
    EXIT WHEN array_length(available_products, 1) < 1;
    
    product_index := 1 + floor(random() * array_length(available_products, 1))::int;
    product_id := available_products[product_index];
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id2, product_id, random_quantity, product_price);
    
    total_amount2 := total_amount2 + (product_price * random_quantity);
    
    SELECT array_remove(available_products, product_id) INTO available_products;
  END LOOP;
  
  UPDATE orders SET total = total_amount2 WHERE id = order_id2;
  
  -- Add items to Order 3 (Shipped)
  available_products := product_ids;
  FOR i IN 1..1 LOOP
    EXIT WHEN array_length(available_products, 1) < 1;
    
    product_index := 1 + floor(random() * array_length(available_products, 1))::int;
    product_id := available_products[product_index];
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id3, product_id, random_quantity, product_price);
    
    total_amount3 := total_amount3 + (product_price * random_quantity);
    
    SELECT array_remove(available_products, product_id) INTO available_products;
  END LOOP;
  
  UPDATE orders SET total = total_amount3 WHERE id = order_id3;
  
  -- Add items to Order 4 (Delivered)
  available_products := product_ids;
  FOR i IN 1..4 LOOP
    EXIT WHEN array_length(available_products, 1) < 1;
    
    product_index := 1 + floor(random() * array_length(available_products, 1))::int;
    product_id := available_products[product_index];
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id4, product_id, random_quantity, product_price);
    
    total_amount4 := total_amount4 + (product_price * random_quantity);
    
    SELECT array_remove(available_products, product_id) INTO available_products;
  END LOOP;
  
  UPDATE orders SET total = total_amount4 WHERE id = order_id4;
  
  -- Add items to Order 5 (Cancelled)
  available_products := product_ids;
  FOR i IN 1..2 LOOP
    EXIT WHEN array_length(available_products, 1) < 1;
    
    product_index := 1 + floor(random() * array_length(available_products, 1))::int;
    product_id := available_products[product_index];
    SELECT COALESCE(discount_price, price) INTO product_price FROM products WHERE id = product_id;
    random_quantity := 1 + floor(random() * 3)::int;
    
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (order_id5, product_id, random_quantity, product_price);
    
    total_amount5 := total_amount5 + (product_price * random_quantity);
    
    SELECT array_remove(available_products, product_id) INTO available_products;
  END LOOP;
  
  UPDATE orders SET total = total_amount5 WHERE id = order_id5;
  
  RAISE NOTICE 'Created 5 demo orders with items';
END;
$$;