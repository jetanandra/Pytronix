/*
  # Hero Slides Management System

  1. New Tables
    - `hero_slides`
      - `id` (uuid, primary key)
      - `image` (text, not null)
      - `title` (text, not null)
      - `subtitle` (text, not null)
      - `cta_text` (text)
      - `cta_link` (text)
      - `enabled` (boolean, default true)
      - `order` (integer, not null)
      - `created_at` (timestamptz, default now())
  
  2. Security
    - Enable RLS on the table
    - Add policies for admin users to manage hero slides
    - Allow public read access for displaying on the homepage
*/

-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  cta_text text,
  cta_link text,
  enabled boolean DEFAULT true,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policies for hero_slides
CREATE POLICY "Public can view hero slides" 
  ON hero_slides
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin users can manage hero slides" 
  ON hero_slides
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
  WITH CHECK (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Insert sample hero slides
INSERT INTO hero_slides (image, title, subtitle, cta_text, cta_link, enabled, "order")
VALUES 
  ('https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg', 'Build The Future', 'With Phytronix', 'Explore Products', '/products', true, 1),
  ('https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg', 'Cutting-Edge', 'IoT Components', 'Shop Now', '/products', true, 2),
  ('https://images.pexels.com/photos/1472443/pexels-photo-1472443.jpeg', 'Innovative', 'Tech Solutions', 'Learn More', '/about', true, 3),
  ('https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg', 'Empower', 'Your Projects', 'Get Started', '/products', true, 4),
  ('https://images.pexels.com/photos/2336123/pexels-photo-2336123.jpeg', 'Connect', 'Your Ideas', 'Discover More', '/workshops', true, 5);