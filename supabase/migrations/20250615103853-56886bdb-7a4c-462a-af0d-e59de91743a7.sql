
-- Add foreign key constraint from post_comments.user_id to profiles.user_id
ALTER TABLE public.post_comments 
ADD CONSTRAINT post_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add index for better performance on the foreign key
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id_fkey ON public.post_comments(user_id);
