-- Create the replacement-images bucket if it doesn't exist 
-- (Only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'replacement-images'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('replacement-images', 'replacement-images', true);
  END IF;
END $$;

-- Check if policies already exist before creating them
DO $$
BEGIN
  -- Policy 1: Users upload images for their orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can upload replacement images'
  ) THEN
    CREATE POLICY "Users can upload replacement images"
    ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'replacement-images' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM orders WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Policy 2: Users update their own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update their own replacement images'
  ) THEN
    CREATE POLICY "Users can update their own replacement images"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (
      bucket_id = 'replacement-images' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM orders WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Policy 3: Users delete their own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete their own replacement images'
  ) THEN
    CREATE POLICY "Users can delete their own replacement images"
    ON storage.objects
    FOR DELETE TO authenticated
    USING (
      bucket_id = 'replacement-images' AND
      (storage.foldername(name))[1] IN (
        SELECT id::text FROM orders WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- Policy 4: Public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public can view replacement images'
  ) THEN
    CREATE POLICY "Public can view replacement images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'replacement-images');
  END IF;
END $$;