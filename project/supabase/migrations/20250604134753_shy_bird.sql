/*
  # Update Storage Policies with Proper Role Checks

  1. Changes
    - Add bucket if it doesn't exist
    - Drop existing policies if they exist
    - Create new policies with proper role checks
    - Grant necessary permissions
  
  2. Security
    - Ensure authenticated users can upload and read files
    - Maintain owner-based access control
    - Add proper role checks
*/

-- Enable Storage Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to read their own files" ON storage.objects;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Policy to allow users to read their own files
CREATE POLICY "Allow users to read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
  AND owner = auth.uid()
);

-- Grant usage on necessary schemas
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;