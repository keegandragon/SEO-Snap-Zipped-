/*
  # Fix users table RLS policies

  1. Changes
    - Update INSERT policy for users table to allow registration
    - Keep existing policies for SELECT and UPDATE

  2. Security
    - Allow new user registration while maintaining data security
    - Users can still only read and update their own data
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create new INSERT policy that allows registration
CREATE POLICY "Enable user registration" ON users
FOR INSERT TO authenticated, anon
WITH CHECK (
  -- Either the user is not authenticated (new registration)
  -- OR they are authenticated and inserting their own data
  (auth.uid() IS NULL) OR
  (auth.uid() = auth_id)
);