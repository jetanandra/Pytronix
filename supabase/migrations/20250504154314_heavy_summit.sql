/*
  # Update products table RLS policies

  1. Changes
    - Modified the INSERT and UPDATE RLS policies to correctly check for admin role in user_metadata
    - Existing policies are looking directly at 'role' in JWT, but the role is stored in user_metadata
    
  2. Security
    - Maintains security by ensuring only admin users can insert/update products
    - Preserves the public read access for products
*/

-- Drop the existing policies for INSERT and UPDATE
DROP POLICY IF EXISTS "Admin users can insert products" ON public.products;
DROP POLICY IF EXISTS "Admin users can update products" ON public.products;

-- Create new policies with the correct check for admin role in user_metadata
CREATE POLICY "Admin users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');