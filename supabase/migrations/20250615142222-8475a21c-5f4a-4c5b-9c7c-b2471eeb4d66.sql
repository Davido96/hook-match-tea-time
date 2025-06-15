
-- Add status field to likes table to track pending/accepted/rejected states
ALTER TABLE public.likes 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE public.likes 
ADD CONSTRAINT likes_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_likes_status 
ON public.likes (status);

-- Create index for recipient to find incoming likes efficiently
CREATE INDEX IF NOT EXISTS idx_likes_recipient_status 
ON public.likes (recipient_id, status);

-- Update the match creation trigger to handle the new acceptance flow
CREATE OR REPLACE FUNCTION public.create_match_on_like_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  mutual_like_exists BOOLEAN;
  new_match_id UUID;
  existing_match_id UUID;
BEGIN
  -- Only process if like is being accepted
  IF NEW.status != 'accepted' OR OLD.status = 'accepted' THEN
    RETURN NEW;
  END IF;
  
  RAISE NOTICE 'Processing like acceptance from % to %', NEW.recipient_id, NEW.sender_id;
  
  -- Check if there's a mutual like (the original sender's like exists and is pending/accepted)
  SELECT EXISTS(
    SELECT 1 FROM public.likes 
    WHERE sender_id = NEW.recipient_id 
    AND recipient_id = NEW.sender_id
    AND status IN ('pending', 'accepted')
  ) INTO mutual_like_exists;
  
  RAISE NOTICE 'Mutual like exists: %', mutual_like_exists;
  
  -- If mutual like exists, create a match
  IF mutual_like_exists THEN
    -- Check if match already exists
    SELECT id INTO existing_match_id
    FROM public.matches 
    WHERE (user1_id = LEAST(NEW.sender_id, NEW.recipient_id) 
           AND user2_id = GREATEST(NEW.sender_id, NEW.recipient_id))
    AND is_active = true;
    
    IF existing_match_id IS NOT NULL THEN
      RAISE NOTICE 'Match already exists: %', existing_match_id;
      RETURN NEW;
    END IF;
    
    -- Create match (ensure consistent ordering of user IDs)
    INSERT INTO public.matches (user1_id, user2_id, is_active)
    VALUES (
      LEAST(NEW.sender_id, NEW.recipient_id),
      GREATEST(NEW.sender_id, NEW.recipient_id),
      true
    )
    RETURNING id INTO new_match_id;
    
    RAISE NOTICE 'Created new match: %', new_match_id;
    
    -- If match was created, create conversation
    IF new_match_id IS NOT NULL THEN
      INSERT INTO public.conversations (match_id)
      VALUES (new_match_id)
      ON CONFLICT (match_id) DO NOTHING;
      
      RAISE NOTICE 'Created conversation for match: %', new_match_id;
      
      -- Update both likes to accepted status
      UPDATE public.likes 
      SET status = 'accepted' 
      WHERE ((sender_id = NEW.sender_id AND recipient_id = NEW.recipient_id) 
             OR (sender_id = NEW.recipient_id AND recipient_id = NEW.sender_id))
      AND status != 'accepted';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop the old trigger and create new one
DROP TRIGGER IF EXISTS create_match_on_mutual_like_trigger ON public.likes;

CREATE TRIGGER create_match_on_like_acceptance_trigger
  AFTER UPDATE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_like_acceptance();

-- Create function to get incoming likes for a user
CREATE OR REPLACE FUNCTION public.get_incoming_likes(user_uuid uuid)
RETURNS TABLE(
  like_id uuid,
  sender_id uuid,
  sender_name text,
  sender_age integer,
  sender_bio text,
  sender_avatar_url text,
  sender_interests text[],
  sender_location_city text,
  sender_location_state text,
  sender_user_type text,
  sender_verification_status text,
  is_super_like boolean,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    l.id as like_id,
    l.sender_id,
    p.name as sender_name,
    p.age as sender_age,
    p.bio as sender_bio,
    p.avatar_url as sender_avatar_url,
    p.interests as sender_interests,
    p.location_city as sender_location_city,
    p.location_state as sender_location_state,
    p.user_type as sender_user_type,
    p.verification_status as sender_verification_status,
    l.is_super_like,
    l.created_at
  FROM public.likes l
  JOIN public.profiles p ON p.user_id = l.sender_id
  WHERE l.recipient_id = user_uuid 
    AND l.status = 'pending'
  ORDER BY l.created_at DESC;
END;
$function$;

-- Create function to accept/reject incoming likes
CREATE OR REPLACE FUNCTION public.respond_to_like(like_id_param uuid, response_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  like_record record;
BEGIN
  -- Validate response status
  IF response_status NOT IN ('accepted', 'rejected') THEN
    RAISE EXCEPTION 'Invalid response status. Must be "accepted" or "rejected"';
  END IF;
  
  -- Get the like record and verify ownership
  SELECT * INTO like_record
  FROM public.likes 
  WHERE id = like_id_param 
    AND recipient_id = auth.uid()
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Like not found or not eligible for response';
  END IF;
  
  -- Update the like status
  UPDATE public.likes 
  SET status = response_status, 
      updated_at = now()
  WHERE id = like_id_param;
  
  RETURN true;
END;
$function$;

-- Create notifications for new likes
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sender_name text;
BEGIN
  -- Get sender name for notification
  SELECT name INTO sender_name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;
  
  -- Create notification for recipient
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.recipient_id,
    CASE WHEN NEW.is_super_like THEN 'super_like_received' ELSE 'like_received' END,
    CASE WHEN NEW.is_super_like THEN 'Super Like Received! ⚡' ELSE 'New Like Received! 💕' END,
    format('%s %s you! Check your incoming likes to respond.', 
           COALESCE(sender_name, 'Someone'), 
           CASE WHEN NEW.is_super_like THEN 'super liked' ELSE 'liked' END),
    jsonb_build_object(
      'sender_id', NEW.sender_id,
      'sender_name', sender_name,
      'like_id', NEW.id,
      'is_super_like', NEW.is_super_like
    )
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger for like notifications
CREATE TRIGGER create_like_notification_trigger
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION create_like_notification();
