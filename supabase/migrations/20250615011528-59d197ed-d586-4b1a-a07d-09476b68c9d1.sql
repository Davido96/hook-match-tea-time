
-- Create user subscription tiers table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'basic', 'pro', 'vip')),
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  keys_paid INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily usage tracking table
CREATE TABLE public.daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  swipes_used INTEGER NOT NULL DEFAULT 0,
  super_likes_used INTEGER NOT NULL DEFAULT 0,
  rewinds_used INTEGER NOT NULL DEFAULT 0,
  message_credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create super likes table
CREATE TABLE public.super_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, recipient_id)
);

-- Create likes table for regular likes
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  is_super_like BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, recipient_id)
);

-- Create message credits table
CREATE TABLE public.message_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  credits_balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create media messages table
CREATE TABLE public.media_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video', 'voice', 'file')),
  media_url TEXT NOT NULL,
  caption TEXT,
  is_disappearing BOOLEAN NOT NULL DEFAULT false,
  disappears_at TIMESTAMP WITH TIME ZONE,
  credits_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
  ON public.user_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for daily_usage
CREATE POLICY "Users can view their own usage" 
  ON public.daily_usage 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for super_likes
CREATE POLICY "Users can view super_likes they sent or received" 
  ON public.super_likes 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create super_likes" 
  ON public.super_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Create RLS policies for likes
CREATE POLICY "Users can view likes they sent or received" 
  ON public.likes 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create likes" 
  ON public.likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Create RLS policies for message_credits
CREATE POLICY "Users can view their own message credits" 
  ON public.message_credits 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create RLS policies for media_messages
CREATE POLICY "Users can view media messages they sent or received" 
  ON public.media_messages 
  FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create media messages" 
  ON public.media_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

-- Create function to get user's current tier
CREATE OR REPLACE FUNCTION public.get_user_tier(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier TEXT;
BEGIN
  SELECT tier INTO user_tier
  FROM public.user_subscriptions
  WHERE user_id = user_uuid 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY CASE tier
    WHEN 'vip' THEN 4
    WHEN 'pro' THEN 3
    WHEN 'basic' THEN 2
    WHEN 'free' THEN 1
    ELSE 0
  END DESC
  LIMIT 1;
  
  RETURN COALESCE(user_tier, 'free');
END;
$$;

-- Create function to check daily limits
CREATE OR REPLACE FUNCTION public.check_daily_limit(
  user_uuid UUID,
  action_type TEXT,
  limit_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage INTEGER;
BEGIN
  -- Get current usage for today
  SELECT CASE action_type
    WHEN 'swipes' THEN swipes_used
    WHEN 'super_likes' THEN super_likes_used
    WHEN 'rewinds' THEN rewinds_used
    WHEN 'message_credits' THEN message_credits_used
    ELSE 0
  END INTO current_usage
  FROM public.daily_usage
  WHERE user_id = user_uuid AND date = CURRENT_DATE;
  
  -- If no record exists, usage is 0
  current_usage := COALESCE(current_usage, 0);
  
  -- Check if under limit
  RETURN current_usage < limit_amount;
END;
$$;

-- Create function to increment daily usage
CREATE OR REPLACE FUNCTION public.increment_daily_usage(
  user_uuid UUID,
  action_type TEXT,
  increment_amount INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.daily_usage (user_id, date)
  VALUES (user_uuid, CURRENT_DATE)
  ON CONFLICT (user_id, date) DO NOTHING;
  
  UPDATE public.daily_usage
  SET 
    swipes_used = CASE WHEN action_type = 'swipes' THEN swipes_used + increment_amount ELSE swipes_used END,
    super_likes_used = CASE WHEN action_type = 'super_likes' THEN super_likes_used + increment_amount ELSE super_likes_used END,
    rewinds_used = CASE WHEN action_type = 'rewinds' THEN rewinds_used + increment_amount ELSE rewinds_used END,
    message_credits_used = CASE WHEN action_type = 'message_credits' THEN message_credits_used + increment_amount ELSE message_credits_used END,
    updated_at = now()
  WHERE user_id = user_uuid AND date = CURRENT_DATE;
END;
$$;

-- Create trigger to automatically create free tier subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create free tier subscription for new user
  INSERT INTO public.user_subscriptions (user_id, tier, is_active)
  VALUES (NEW.id, 'free', true);
  
  -- Create message credits record for new user
  INSERT INTO public.message_credits (user_id, credits_balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new user setup
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();
