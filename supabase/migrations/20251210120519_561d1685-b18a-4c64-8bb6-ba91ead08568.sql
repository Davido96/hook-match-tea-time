-- Add verification_video_url column to profiles table for creator video verification
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_video_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN public.profiles.verification_video_url IS 'URL to the 10-second video recorded during creator onboarding for identity verification';