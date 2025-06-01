/*
  # Product Reviews and Ratings System

  1. New Tables
    - `product_reviews` - Store customer product reviews and ratings
  
  2. New Functions
    - `get_product_average_rating` - Calculate average rating and review count
    - `increment_review_helpful_votes` - Increment helpful votes on review
    - `update_product_rating` - Update product ratings when reviews change
  
  3. New Triggers
    - Automatically update product ratings when reviews are added/changed/deleted
  
  4. Security
    - RLS policies for review creation and management
    - All users can read reviews
    - Only the review author can update/delete their reviews
    - Admins can manage all reviews
*/

-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  helpful_votes integer DEFAULT 0,
  is_verified_purchase boolean DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Update trigger for updated_at
CREATE TRIGGER update_product_reviews_modtime
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Function to get the average rating and count for a product
CREATE OR REPLACE FUNCTION get_product_average_rating(product_id uuid)
RETURNS TABLE (average numeric, count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT 
      COALESCE(AVG(rating)::numeric(3,2), 0) as average,
      COUNT(*) as count
    FROM product_reviews
    WHERE product_reviews.product_id = $1;
END;
$$;

-- Function to increment helpful votes
CREATE OR REPLACE FUNCTION increment_review_helpful_votes(review_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_reviews
  SET helpful_votes = helpful_votes + 1
  WHERE id = review_id;
END;
$$;

-- Function to update product rating when reviews are added, updated, or deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating numeric;
  review_count bigint;
BEGIN
  -- Calculate new rating stats
  SELECT * INTO avg_rating, review_count FROM get_product_average_rating(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.product_id
      ELSE NEW.product_id
    END
  );

  -- Update the product
  UPDATE products
  SET 
    rating = avg_rating,
    reviews = review_count
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.product_id
    ELSE NEW.product_id
  END;

  RETURN NULL;
END;
$$;

-- Create triggers to automatically update product rating
CREATE TRIGGER update_product_rating_on_review_change
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to view reviews
CREATE POLICY "Anyone can view reviews"
  ON product_reviews
  FOR SELECT
  USING (true);

-- Allow authenticated users to create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON product_reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON product_reviews
  FOR ALL
  TO authenticated
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);