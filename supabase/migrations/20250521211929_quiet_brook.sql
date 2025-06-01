-- Create hero-slides storage bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'hero-slides'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('hero-slides', 'hero-slides', true);
  END IF;
END $$;

-- Create policies for the hero-slides bucket
DO $$
BEGIN
  -- Policy 1: Admin users can upload images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admin users can upload hero slides'
  ) THEN
    CREATE POLICY "Admin users can upload hero slides"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'hero-slides' AND
      ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    );
  END IF;

  -- Policy 2: Admin users can update their own images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admin users can update hero slides'
  ) THEN
    CREATE POLICY "Admin users can update hero slides"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'hero-slides' AND
      ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    );
  END IF;

  -- Policy 3: Admin users can delete images
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Admin users can delete hero slides'
  ) THEN
    CREATE POLICY "Admin users can delete hero slides"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'hero-slides' AND
      ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text
    );
  END IF;

  -- Policy 4: Public read access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public can view hero slides'
  ) THEN
    CREATE POLICY "Public can view hero slides"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'hero-slides');
  END IF;
END $$;