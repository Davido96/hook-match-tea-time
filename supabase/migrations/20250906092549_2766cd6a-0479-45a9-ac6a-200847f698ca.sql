-- Update the match creation trigger to also handle gamified actions for matches
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    
    -- Add match XP and check achievements for both users
    PERFORM handle_user_action(NEW.sender_id, 'matches', 1);
    PERFORM handle_user_action(NEW.recipient_id, 'matches', 1);
    
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
$function$;

-- Update the other match creation trigger too
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
    
    -- Add match XP and check achievements for both users
    PERFORM handle_user_action(NEW.sender_id, 'matches', 1);
    PERFORM handle_user_action(NEW.recipient_id, 'matches', 1);
    
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
$function$;