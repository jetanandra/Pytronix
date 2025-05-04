/*
  # Update products table for enhanced product features

  1. New Fields
    - `images` (text[]): Array for storing multiple product images (up to 5)
    - `full_description` (text): Full markdown product description
    - `specifications` (jsonb): Product specifications in key-value format
    - `warranty_info` (text): Details about return policy and warranty

  2. Changes
    - Keeps existing `image` field as primary/thumbnail image
    - Adds new fields for enhanced product management
    - Adds indices for better query performance
*/

-- Add new fields to products table
ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS full_description text,
ADD COLUMN IF NOT EXISTS specifications jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS warranty_info text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_products_specifications ON products USING gin (specifications);