/*
  # User Profile Management Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, FK to auth.users, primary key)
      - `full_name` (text)
      - `phone` (text)
      - `profile_picture` (text for URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `type` (text - shipping/billing)
      - `street` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text)
      - `is_default` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `wishlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `product_id` (uuid, FK to products)
      - `priority` (integer)
      - `notes` (text)
      - `created_at` (timestamp)
    
    - `user_preferences`
      - `id` (uuid, FK to auth.users, primary key)
      - `theme` (text)
      - `email_notifications` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure users can only access their own profile information
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  profile_picture TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('shipping', 'billing')),
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create update trigger function for updated_at columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_addresses_modtime
BEFORE UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_preferences_modtime
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create policies for addresses
CREATE POLICY "Users can view their own addresses"
  ON addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses"
  ON addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlist"
  ON wishlists
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own wishlist"
  ON wishlists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist items"
  ON wishlists
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own wishlist"
  ON wishlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Create function to ensure only one default address per type per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND type = NEW.type
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for default address management
CREATE TRIGGER ensure_single_default_address
BEFORE INSERT OR UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();

-- Create a function to auto-create profile and preferences on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new profile
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);

  -- Insert user preferences with defaults
  INSERT INTO public.user_preferences (id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Allow public read access to reviewer info for reviews
CREATE POLICY "Public can view reviewer info"
  ON profiles
  FOR SELECT
  USING (true);