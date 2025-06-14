
-- Create a storage bucket for exclusive content (images and videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('exclusive-content', 'exclusive-content', true);

-- Create RLS policies for the exclusive-content bucket
CREATE POLICY "Users can upload their own content" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'exclusive-content' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all exclusive content" ON storage.objects
FOR SELECT USING (bucket_id = 'exclusive-content');

CREATE POLICY "Users can update their own content" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'exclusive-content' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own content" ON storage.objects
FOR DELETE USING (
  bucket_id = 'exclusive-content' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add media_type column to exclusive_posts table to distinguish between images and videos
ALTER TABLE exclusive_posts ADD COLUMN media_type text DEFAULT 'image';

-- Rename image_url to media_url for better clarity
ALTER TABLE exclusive_posts RENAME COLUMN image_url TO media_url;
