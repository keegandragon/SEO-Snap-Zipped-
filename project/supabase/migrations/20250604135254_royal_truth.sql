/*
  # Fix Storage Policies for Image Uploads

  1. Changes
    - Update storage policies to use correct JWT authentication checks
    - Drop existing policies to avoid conflicts
    - Grant necessary permissions to authenticated users
  
  2. Security
    - Enable policies for product-images bucket
    - Only authenticated users can upload and read images
    - Users can only access their own images
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
  AND auth.jwt()->>'role' = 'authenticated'
);

-- Policy to allow users to read their own files
CREATE POLICY "Allow users to read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND auth.jwt()->>'role' = 'authenticated'
  AND owner = auth.uid()
);

-- Grant usage on necessary schemas
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;