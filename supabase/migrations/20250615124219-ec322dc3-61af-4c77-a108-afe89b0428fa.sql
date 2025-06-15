
-- Create matches table to store mutual likes between users
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user1_id, user2_id)
);

-- Create conversations table to manage chat conversations between matched users
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(match_id)
);

-- Create messages table for text-based chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Add Row Level Security (RLS) for matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" 
  ON public.matches 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" 
  ON public.matches 
  FOR INSERT 
  WITH CHECK (true);

-- Add Row Level Security (RLS) for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations from their matches" 
  ON public.conversations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = conversations.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "System can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = conversations.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- Add Row Level Security (RLS) for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

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

-- Enable realtime for live messaging
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.messages;

ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.conversations;

ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.matches;

-- Create function to detect and create matches from mutual likes
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mutual_like_exists BOOLEAN;
  match_id UUID;
BEGIN
  -- Check if there's a mutual like (the other person already liked this user)
  SELECT EXISTS(
    SELECT 1 FROM public.likes 
    WHERE sender_id = NEW.recipient_id 
    AND recipient_id = NEW.sender_id
  ) INTO mutual_like_exists;
  
  -- If mutual like exists, create a match
  IF mutual_like_exists THEN
    -- Create match (ensure consistent ordering of user IDs)
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.sender_id, NEW.recipient_id),
      GREATEST(NEW.sender_id, NEW.recipient_id)
    )
    ON CONFLICT (user1_id, user2_id) DO NOTHING
    RETURNING id INTO match_id;
    
    -- If match was created, create conversation
    IF match_id IS NOT NULL THEN
      INSERT INTO public.conversations (match_id)
      VALUES (match_id)
      ON CONFLICT (match_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create matches on mutual likes
CREATE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_match_on_mutual_like();

-- Function to update conversation timestamp when new message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations 
  SET 
    updated_at = now(),
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update conversation when new message is sent
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();
