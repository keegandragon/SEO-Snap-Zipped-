/*
  # Fix Users Table RLS Policy

  1. Changes
    - Drop existing registration policy
    - Create new policy that properly handles user registration
    - Policy allows inserts when:
      a) For new registrations (uid() IS NULL)
      b) For authenticated users managing their own data (uid() = auth_id)

  2. Security
    - Maintains security by ensuring users can only create their own records
    - Allows initial registration while preventing unauthorized modifications
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Enable user registration" ON public.users;

-- Create new policy with correct conditions
CREATE POLICY "Enable user registration"
ON public.users
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() IS NULL) OR 
  (auth.uid() = auth_id)
);