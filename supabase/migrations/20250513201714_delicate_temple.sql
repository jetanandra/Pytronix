/*
  # Create replacement-images storage bucket

  1. Changes:
    - Create a storage bucket named 'replacement-images' for storing product replacement request images
    - Set appropriate public access policies for the bucket
  
  2. Security:
    - Create policy to allow authenticated users to insert into the bucket
    - Create policy to allow public read access to enable image viewing
*/

-- Create the replacement-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('replacement-images', 'replacement-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket

-- Allow users to upload images for their own orders (using RLS)
CREATE POLICY "Users can upload replacement images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'replacement-images' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM orders WHERE user_id = auth.uid()
    )
  );

-- Allow public read access to the images
CREATE POLICY "Public can view replacement images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'replacement-images');