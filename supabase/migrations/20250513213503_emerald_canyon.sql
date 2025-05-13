/*
  # Update product rating manually function

  This creates a new stored function that can be called to 
  manually update a product's rating based on its reviews.
  
  1. Function Details
    - Takes a product_id parameter
    - Calculates average rating from product_reviews
    - Updates the product's rating and review count
*/

-- Function to manually update a product's rating and review count
CREATE OR REPLACE FUNCTION update_product_rating_manually(product_id_param UUID)
RETURNS VOID AS $$
DECLARE
  avg_rating NUMERIC;
  review_count INTEGER;
BEGIN
  -- Calculate the average rating
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO
    avg_rating,
    review_count
  FROM
    product_reviews
  WHERE
    product_id = product_id_param;

  -- Update the product with the new rating and review count
  UPDATE products
  SET
    rating = avg_rating,
    reviews = review_count
  WHERE
    id = product_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or update the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Call our manual update function
  PERFORM update_product_rating_manually(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.product_id
      ELSE NEW.product_id
    END
  );
  
  -- Return the appropriate record based on the operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the trigger exists and create it if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_product_rating_on_review_change'
  ) THEN
    CREATE TRIGGER update_product_rating_on_review_change
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();
  END IF;
END
$$;