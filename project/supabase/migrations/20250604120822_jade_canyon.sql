/*
  # Add Storage Policies for Image Uploads

  1. Changes
    - Create storage policy to allow authenticated users to upload images
    - Create storage policy to allow authenticated users to read their own images
  
  2. Security
    - Enable policies for product-images bucket
    - Only authenticated users can upload and read images
    - Users can only access their own images
*/

-- Enable Storage Policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', false)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
);

-- Policy to allow users to read their own files
CREATE POLICY "Allow users to read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND owner = auth.uid()
);