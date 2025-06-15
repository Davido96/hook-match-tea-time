
-- First, drop the existing trigger that depends on the function
DROP TRIGGER IF EXISTS on_like_created ON public.likes;
DROP TRIGGER IF EXISTS create_match_trigger ON public.likes;
DROP FUNCTION IF EXISTS public.create_match_on_mutual_like();

-- Create the missing get_user_matches function that properly fetches matches with conversation data
CREATE OR REPLACE FUNCTION public.get_user_matches(user_uuid uuid)
RETURNS TABLE(
  match_id uuid,
  other_user_id uuid,
  other_name text,
  other_age integer,
  other_bio text,
  other_avatar_url text,
  other_interests text[],
  other_location_city text,
  other_location_state text,
  other_gender text,
  other_user_type text,
  other_verification_status text,
  other_last_active timestamp with time zone,
  match_created_at timestamp with time zone,
  conversation_id uuid,
  last_message_content text,
  last_message_at timestamp with time zone,
  unread_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    CASE 
      WHEN m.user1_id = user_uuid THEN m.user2_id 
      ELSE m.user1_id 
    END as other_user_id,
    p.name as other_name,
    p.age as other_age,
    p.bio as other_bio,
    p.avatar_url as other_avatar_url,
    p.interests as other_interests,
    p.location_city as other_location_city,
    p.location_state as other_location_state,
    p.gender as other_gender,
    p.user_type as other_user_type,
    p.verification_status as other_verification_status,
    up.last_seen as other_last_active,
    m.created_at as match_created_at,
    c.id as conversation_id,
    (
      SELECT msg.content 
      FROM public.messages msg 
      WHERE msg.conversation_id = c.id 
      ORDER BY msg.created_at DESC 
      LIMIT 1
    ) as last_message_content,
    (
      SELECT msg.created_at 
      FROM public.messages msg 
      WHERE msg.conversation_id = c.id 
      ORDER BY msg.created_at DESC 
      LIMIT 1
    ) as last_message_at,
    (
      SELECT COUNT(*)::integer 
      FROM public.messages msg 
      WHERE msg.conversation_id = c.id 
        AND msg.sender_id != user_uuid 
        AND msg.is_read = false
    ) as unread_count
  FROM public.matches m
  JOIN public.profiles p ON (
    CASE 
      WHEN m.user1_id = user_uuid THEN p.user_id = m.user2_id 
      ELSE p.user_id = m.user1_id 
    END
  )
  LEFT JOIN public.user_presence up ON up.user_id = p.user_id
  LEFT JOIN public.conversations c ON c.match_id = m.id
  WHERE (m.user1_id = user_uuid OR m.user2_id = user_uuid)
    AND m.is_active = true
  ORDER BY COALESCE(
    (SELECT msg.created_at FROM public.messages msg WHERE msg.conversation_id = c.id ORDER BY msg.created_at DESC LIMIT 1),
    m.created_at
  ) DESC;
END;
$$;

-- Create the mark_messages_as_read function
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  conversation_id_param uuid,
  user_id_param uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages 
  SET is_read = true, read_at = now()
  WHERE conversation_id = conversation_id_param 
    AND sender_id != user_id_param 
    AND is_read = false;
END;
$$;

-- Create function to automatically create conversation with welcome message
CREATE OR REPLACE FUNCTION public.ensure_conversation_with_welcome_message(match_id_param uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id_result uuid;
  user1_id_var uuid;
  user2_id_var uuid;
  user1_name text;
  user2_name text;
BEGIN
  -- Get the match details
  SELECT user1_id, user2_id INTO user1_id_var, user2_id_var
  FROM public.matches 
  WHERE id = match_id_param;
  
  -- Get user names
  SELECT name INTO user1_name FROM public.profiles WHERE user_id = user1_id_var;
  SELECT name INTO user2_name FROM public.profiles WHERE user_id = user2_id_var;
  
  -- Create or get existing conversation
  INSERT INTO public.conversations (match_id)
  VALUES (match_id_param)
  ON CONFLICT (match_id) DO NOTHING
  RETURNING id INTO conversation_id_result;
  
  -- If conversation already existed, get its ID
  IF conversation_id_result IS NULL THEN
    SELECT id INTO conversation_id_result
    FROM public.conversations
    WHERE match_id = match_id_param;
  END IF;
  
  -- Check if welcome messages already exist
  IF NOT EXISTS (
    SELECT 1 FROM public.messages 
    WHERE conversation_id = conversation_id_result 
    AND content LIKE '%🎉 Hurray! You have a new match!%'
  ) THEN
    -- Send welcome message to both users
    INSERT INTO public.messages (conversation_id, sender_id, content, message_type, is_read)
    VALUES 
      (conversation_id_result, user1_id_var, '🎉 Hurray! You have a new match with ' || user2_name || '! Start chatting now!', 'system', false),
      (conversation_id_result, user2_id_var, '🎉 Hurray! You have a new match with ' || user1_name || '! Start chatting now!', 'system', false);
  END IF;
  
  RETURN conversation_id_result;
END;
$$;

-- Create the new match creation function
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mutual_like_exists BOOLEAN;
  new_match_id UUID;
  existing_match_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Log the like creation for debugging
  RAISE NOTICE 'Processing like from % to %', NEW.sender_id, NEW.recipient_id;
  
  -- Check if there's a mutual like (the other person already liked this user)
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
    
    -- Create conversation with welcome message
    IF new_match_id IS NOT NULL THEN
      SELECT ensure_conversation_with_welcome_message(new_match_id) INTO new_conversation_id;
      RAISE NOTICE 'Created conversation with welcome message: %', new_conversation_id;
      
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
$$;

-- Create trigger for match creation on like
CREATE TRIGGER create_match_trigger
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_mutual_like();

-- Handle like acceptance trigger
CREATE OR REPLACE FUNCTION public.create_match_on_like_acceptance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mutual_like_exists BOOLEAN;
  new_match_id UUID;
  existing_match_id UUID;
  new_conversation_id UUID;
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
    
    -- Create conversation with welcome message
    IF new_match_id IS NOT NULL THEN
      SELECT ensure_conversation_with_welcome_message(new_match_id) INTO new_conversation_id;
      RAISE NOTICE 'Created conversation with welcome message: %', new_conversation_id;
      
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
$$;

-- Create trigger for like acceptance
DROP TRIGGER IF EXISTS create_match_on_acceptance_trigger ON public.likes;
CREATE TRIGGER create_match_on_acceptance_trigger
  AFTER UPDATE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION create_match_on_like_acceptance();
