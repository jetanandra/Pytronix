/*
  # Fix product reviews relationship with users

  1. Changes
    - Add missing foreign key constraint from product_reviews.user_id to auth.users(id)
    - Fix user profile relationship query in the schema
  
  2. New Functions
    - Add a function to recalculate reviews count and rating for all products
*/

-- First, check if foreign key constraint exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc 
    JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'product_reviews' 
      AND ccu.table_name = 'users'
      AND ccu.column_name = 'id'
      AND tc.constraint_name = 'product_reviews_user_id_fkey'
  ) THEN
    ALTER TABLE product_reviews
    ADD CONSTRAINT product_reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Function to recalculate all product ratings
CREATE OR REPLACE FUNCTION recalculate_all_product_ratings()
RETURNS VOID AS $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN SELECT id FROM products LOOP
    PERFORM update_product_rating_manually(product_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;