
-- Fix ambiguous column references in RLS policies for conversations and messages tables

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view conversations from their matches" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create improved RLS policies with proper table aliases for conversations
CREATE POLICY "Users can view conversations from their matches" 
  ON public.conversations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = conversations.match_id 
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = conversations.match_id 
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Create improved RLS policies with proper table aliases for messages
CREATE POLICY "Users can view messages from their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.matches m ON c.match_id = m.id
      WHERE c.id = messages.conversation_id 
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.matches m ON c.match_id = m.id
      WHERE c.id = conversation_id 
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.matches m ON c.match_id = m.id
      WHERE c.id = messages.conversation_id 
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- Improve the match creation function to be more robust
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mutual_like_exists BOOLEAN;
  new_match_id UUID;
  existing_match_id UUID;
BEGIN
  -- Log the like creation for debugging
  RAISE NOTICE 'Processing like from % to %', NEW.sender_id, NEW.recipient_id;
  
  -- Check if there's a mutual like (the other person already liked this user)
  SELECT EXISTS(
    SELECT 1 FROM public.likes 
    WHERE sender_id = NEW.recipient_id 
    AND recipient_id = NEW.sender_id
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
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_like_created ON public.likes;
CREATE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_match_on_mutual_like();

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON public.conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_likes_sender_recipient ON public.likes(sender_id, recipient_id);
