/*
  # Set up authentication schema

  1. Changes
    - Add auth schema configuration
    - Add auth policies for users table
    - Update users table to work with Supabase Auth

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Update users table to work with Supabase Auth
ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint on auth_id
ALTER TABLE users
ADD CONSTRAINT users_auth_id_key UNIQUE (auth_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth_id = auth.uid());

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own data"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth_id = auth.uid());

-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();