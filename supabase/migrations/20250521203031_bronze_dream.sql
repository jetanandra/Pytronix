/*
  # Workshop Category System Enhancements

  1. Changes
    - Add category_id field to workshops table to properly link workshops to categories
    - Update existing workshops to use the new category_id field
    - Add indexes for better query performance
  
  2. Data Migration
    - Map existing category text values to category IDs
    - Preserve backward compatibility
*/

-- Add category_id to workshops table
ALTER TABLE IF EXISTS workshops
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES workshop_categories(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_workshops_category_id ON workshops(category_id);

-- Update existing workshops to use category_id based on category name
DO $$
DECLARE
  category_record RECORD;
  workshop_record RECORD;
BEGIN
  -- For each workshop category
  FOR category_record IN SELECT id, name FROM workshop_categories LOOP
    -- Update all workshops with matching category name
    UPDATE workshops
    SET category_id = category_record.id
    WHERE category = category_record.name
    AND category_id IS NULL;
  END LOOP;
END;
$$;