
-- Add unique constraint to prevent duplicate likes
ALTER TABLE public.likes 
ADD CONSTRAINT likes_sender_recipient_unique 
UNIQUE (sender_id, recipient_id);

-- Add index for better performance on like checks
CREATE INDEX IF NOT EXISTS idx_likes_sender_recipient 
ON public.likes (sender_id, recipient_id);
