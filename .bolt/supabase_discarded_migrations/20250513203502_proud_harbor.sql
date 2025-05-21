-- Create the replacement-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('replacement-images', 'replacement-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket

-- Allow users to upload images for their own orders (using RLS)
CREATE POLICY "Users can upload replacement images"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'replacement-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM orders WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their own replacement images"
ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'replacement-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM orders WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own replacement images"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'replacement-images' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM orders WHERE user_id = auth.uid()
  )
);

-- Allow public read access to the images
CREATE POLICY "Public can view replacement images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'replacement-images');