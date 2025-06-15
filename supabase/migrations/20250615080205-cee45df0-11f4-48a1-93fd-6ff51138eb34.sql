
-- Create user_activity table for tracking streaks and activity
CREATE TABLE public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active_date date NOT NULL DEFAULT CURRENT_DATE,
  current_streak_days integer NOT NULL DEFAULT 1,
  longest_streak_days integer NOT NULL DEFAULT 1,
  total_discovery_days integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_activity
CREATE POLICY "Users can view their own activity" 
  ON public.user_activity 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" 
  ON public.user_activity 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" 
  ON public.user_activity 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create user_presence table for real-time online status
CREATE TABLE public.user_presence (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  is_online boolean NOT NULL DEFAULT false,
  status text DEFAULT 'online',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_presence
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_presence
CREATE POLICY "Users can view all user presence" 
  ON public.user_presence 
  FOR SELECT 
  TO authenticated;

CREATE POLICY "Users can update their own presence" 
  ON public.user_presence 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presence" 
  ON public.user_presence 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Function to update user streak
CREATE OR REPLACE FUNCTION public.update_user_streak(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_active date;
  current_streak int;
  longest_streak int;
  total_days int;
  streak_broken boolean := false;
BEGIN
  -- Get current activity data
  SELECT 
    last_active_date, 
    current_streak_days, 
    longest_streak_days,
    total_discovery_days
  INTO last_active, current_streak, longest_streak, total_days
  FROM public.user_activity 
  WHERE user_id = user_uuid;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_activity (user_id, last_active_date, current_streak_days, longest_streak_days, total_discovery_days)
    VALUES (user_uuid, CURRENT_DATE, 1, 1, 1);
    RETURN;
  END IF;
  
  -- Check if user was active yesterday or today
  IF last_active = CURRENT_DATE THEN
    -- Already counted today, no update needed
    RETURN;
  ELSIF last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continue streak
    current_streak := current_streak + 1;
    total_days := total_days + 1;
  ELSIF last_active < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak broken, reset to 1
    current_streak := 1;
    total_days := total_days + 1;
    streak_broken := true;
  END IF;
  
  -- Update longest streak if current is longer
  IF current_streak > longest_streak THEN
    longest_streak := current_streak;
  END IF;
  
  -- Update the record
  UPDATE public.user_activity 
  SET 
    last_active_date = CURRENT_DATE,
    current_streak_days = current_streak,
    longest_streak_days = longest_streak,
    total_discovery_days = total_days,
    updated_at = now()
  WHERE user_id = user_uuid;
END;
$$;

-- Function to get daily stats
CREATE OR REPLACE FUNCTION public.get_daily_stats(user_uuid uuid)
RETURNS TABLE(
  today_swipes integer,
  today_matches integer,
  today_super_likes integer,
  current_streak integer,
  longest_streak integer,
  total_discovery_days integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(du.swipes_used, 0) as today_swipes,
    0 as today_matches, -- Will be calculated from matches table later
    COALESCE(du.super_likes_used, 0) as today_super_likes,
    COALESCE(ua.current_streak_days, 0) as current_streak,
    COALESCE(ua.longest_streak_days, 0) as longest_streak,
    COALESCE(ua.total_discovery_days, 0) as total_discovery_days
  FROM public.user_activity ua
  LEFT JOIN public.daily_usage du ON du.user_id = user_uuid AND du.date = CURRENT_DATE
  WHERE ua.user_id = user_uuid;
END;
$$;

-- Function to update user presence
CREATE OR REPLACE FUNCTION public.update_user_presence(user_uuid uuid, online_status boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, last_seen, is_online, status)
  VALUES (user_uuid, now(), online_status, CASE WHEN online_status THEN 'online' ELSE 'offline' END)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    last_seen = now(),
    is_online = online_status,
    status = CASE WHEN online_status THEN 'online' ELSE 'offline' END,
    updated_at = now();
END;
$$;

-- Function to get user online status
CREATE OR REPLACE FUNCTION public.get_user_status(user_uuid uuid)
RETURNS TABLE(
  is_online boolean,
  last_seen timestamp with time zone,
  status_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_seen_time timestamp with time zone;
  online_status boolean;
BEGIN
  SELECT up.last_seen, up.is_online
  INTO last_seen_time, online_status
  FROM public.user_presence up
  WHERE up.user_id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, null::timestamp with time zone, 'Offline'::text;
    RETURN;
  END IF;
  
  -- Determine status based on last seen time
  IF online_status AND (now() - last_seen_time) < INTERVAL '5 minutes' THEN
    RETURN QUERY SELECT true, last_seen_time, 'Online now'::text;
  ELSIF (now() - last_seen_time) < INTERVAL '1 hour' THEN
    RETURN QUERY SELECT false, last_seen_time, 'Recently active'::text;
  ELSIF (now() - last_seen_time) < INTERVAL '24 hours' THEN
    RETURN QUERY SELECT false, last_seen_time, 'Active today'::text;
  ELSE
    RETURN QUERY SELECT false, last_seen_time, 'Last seen ' || to_char(last_seen_time, 'Mon DD'::text);
  END IF;
END;
$$;

-- Enable realtime for user_presence table
ALTER TABLE public.user_presence REPLICA IDENTITY FULL;
-- Note: The publication will be handled automatically by Supabase
