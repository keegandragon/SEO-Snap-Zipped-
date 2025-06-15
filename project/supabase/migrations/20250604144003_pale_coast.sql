/*
  # Fix Users Table RLS Policies

  1. Changes
    - Remove existing conflicting policies
    - Add new policies that properly handle user registration
    - Ensure authenticated users can manage their own data
    - Allow public registration

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Public registration
      - Authenticated user operations (read/update/delete)
*/

-- First, drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Authenticated users can delete their own records" ON users;
DROP POLICY IF EXISTS "Authenticated users can insert new records" ON users;
DROP POLICY IF EXISTS "Authenticated users can select their own records" ON users;
DROP POLICY IF EXISTS "Authenticated users can update their own records" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow public registration
CREATE POLICY "Allow public registration" ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Allow users to delete their own data
CREATE POLICY "Users can delete own data" ON users
  FOR DELETE
  TO authenticated
  USING (auth_id = auth.uid());