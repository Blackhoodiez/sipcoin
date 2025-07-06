-- Create storage bucket for receipt images (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'receipts') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'receipts', 
      'receipts', 
      true, 
      10485760, -- 10MB limit
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    );
  END IF;
END $$;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Receipt images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;

-- Ensure the receipts bucket exists before creating policies

-- Create storage policies for receipt images
CREATE POLICY "Receipt images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts');

CREATE POLICY "Users can upload their own receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own receipts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own receipts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  ); 