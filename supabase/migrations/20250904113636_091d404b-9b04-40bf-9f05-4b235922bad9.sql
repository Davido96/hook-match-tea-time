-- Create achievements system tables
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'discovery',
  requirement_type TEXT NOT NULL, -- 'streak', 'total_swipes', 'total_matches', etc.
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  keys_reward INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common', -- common, rare, epic, legendary
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements tracking
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create user experience system
CREATE TABLE public.user_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  xp_to_next_level INTEGER NOT NULL DEFAULT 100,
  discovery_level INTEGER NOT NULL DEFAULT 1,
  match_level INTEGER NOT NULL DEFAULT 1,
  social_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenges system
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'event'
  category TEXT NOT NULL DEFAULT 'discovery',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  keys_reward INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user challenges tracking
CREATE TABLE public.user_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (read-only for users)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create user achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their achievement progress" ON public.user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_experience
CREATE POLICY "Users can view their own experience" ON public.user_experience
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own experience" ON public.user_experience
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create user experience" ON public.user_experience
  FOR INSERT WITH CHECK (true);

-- RLS Policies for challenges
CREATE POLICY "Anyone can view active challenges" ON public.challenges
  FOR SELECT USING (is_active = true AND now() BETWEEN starts_at AND expires_at);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenge progress" ON public.user_challenges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their challenge progress" ON public.user_challenges
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create user challenges" ON public.user_challenges
  FOR INSERT WITH CHECK (true);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward, keys_reward, rarity) VALUES
  ('First Week Warrior', 'Complete a 7-day discovery streak', '🔥', 'streak', 'current_streak', 7, 150, 5, 'common'),
  ('Explorer', 'Swipe on 100 profiles', '🗺️', 'discovery', 'total_swipes', 100, 100, 3, 'common'),
  ('Matchmaker', 'Get 10 matches', '💕', 'matching', 'total_matches', 10, 200, 5, 'rare'),
  ('Super Swiper', 'Use 50 super likes', '⚡', 'discovery', 'total_super_likes', 50, 250, 8, 'rare'),
  ('Monthly Master', 'Complete a 30-day streak', '🏆', 'streak', 'current_streak', 30, 500, 20, 'epic'),
  ('Discovery Legend', 'Reach 100 total discovery days', '👑', 'discovery', 'total_discovery_days', 100, 1000, 50, 'legendary'),
  ('Conversation Starter', 'Send 50 messages', '💬', 'social', 'total_messages', 50, 150, 5, 'common'),
  ('Popular Profile', 'Receive 25 likes', '⭐', 'social', 'total_likes_received', 25, 200, 8, 'rare'),
  ('Daily Dedication', 'Complete daily goal 10 times', '🎯', 'streak', 'daily_goals_completed', 10, 300, 10, 'rare'),
  ('Social Butterfly', 'Follow 20 creators', '🦋', 'social', 'total_follows', 20, 180, 6, 'common');

-- Insert sample challenges (weekly rotating)
INSERT INTO public.challenges (name, description, challenge_type, category, requirement_type, requirement_value, xp_reward, keys_reward, starts_at, expires_at) VALUES
  ('Weekend Warrior', 'Complete 50 swipes this weekend', 'weekly', 'discovery', 'swipes', 50, 100, 3, now(), now() + interval '7 days'),
  ('Match Master Monday', 'Get 3 matches today', 'daily', 'matching', 'matches', 3, 75, 2, now(), now() + interval '1 day'),
  ('Super Like Challenge', 'Use 10 super likes this week', 'weekly', 'discovery', 'super_likes', 10, 150, 5, now(), now() + interval '7 days'),
  ('Discovery Marathon', 'Maintain a 3-day streak', 'weekly', 'streak', 'streak', 3, 200, 8, now(), now() + interval '7 days');

-- Create function to calculate XP for next level
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(level_num INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- XP required increases by 100 per level (100, 200, 300, etc.)
  RETURN level_num * 100;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user experience
CREATE OR REPLACE FUNCTION public.add_user_experience(user_uuid UUID, xp_amount INTEGER)
RETURNS VOID AS $$
DECLARE
  current_total_xp INTEGER;
  current_level INTEGER;
  new_total_xp INTEGER;
  new_level INTEGER;
  xp_needed INTEGER;
BEGIN
  -- Get current XP and level
  SELECT total_xp, current_level INTO current_total_xp, current_level
  FROM public.user_experience 
  WHERE user_id = user_uuid;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO public.user_experience (user_id, total_xp, current_level, xp_to_next_level)
    VALUES (user_uuid, xp_amount, 1, calculate_xp_for_level(2) - xp_amount);
    RETURN;
  END IF;
  
  -- Calculate new XP total
  new_total_xp := current_total_xp + xp_amount;
  new_level := current_level;
  
  -- Check if user leveled up
  WHILE new_total_xp >= (SELECT SUM(calculate_xp_for_level(i)) FROM generate_series(1, new_level) AS i) LOOP
    new_level := new_level + 1;
  END LOOP;
  
  -- Calculate XP needed for next level
  xp_needed := (SELECT SUM(calculate_xp_for_level(i)) FROM generate_series(1, new_level) AS i) - new_total_xp;
  
  -- Update user experience
  UPDATE public.user_experience 
  SET 
    total_xp = new_total_xp,
    current_level = new_level,
    xp_to_next_level = xp_needed,
    updated_at = now()
  WHERE user_id = user_uuid;
  
  -- If user leveled up, create notification
  IF new_level > current_level THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
      user_uuid,
      'level_up',
      'Level Up! 🎉',
      format('Congratulations! You reached level %s', new_level),
      jsonb_build_object('new_level', new_level, 'xp_gained', xp_amount)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  achievement_record RECORD;
  user_stat INTEGER;
  stat_query TEXT;
BEGIN
  -- Loop through all active achievements
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT achievement_id FROM public.user_achievements 
      WHERE user_id = user_uuid AND is_completed = true
    )
  LOOP
    -- Get the current stat value for the user based on achievement requirement
    CASE achievement_record.requirement_type
      WHEN 'current_streak' THEN
        SELECT current_streak_days INTO user_stat 
        FROM public.user_activity WHERE user_id = user_uuid;
        
      WHEN 'total_swipes' THEN
        SELECT COALESCE(SUM(swipes_used), 0) INTO user_stat
        FROM public.daily_usage WHERE user_id = user_uuid;
        
      WHEN 'total_matches' THEN
        SELECT COUNT(*) INTO user_stat
        FROM public.matches 
        WHERE (user1_id = user_uuid OR user2_id = user_uuid) AND is_active = true;
        
      WHEN 'total_super_likes' THEN
        SELECT COALESCE(SUM(super_likes_used), 0) INTO user_stat
        FROM public.daily_usage WHERE user_id = user_uuid;
        
      WHEN 'total_discovery_days' THEN
        SELECT total_discovery_days INTO user_stat
        FROM public.user_activity WHERE user_id = user_uuid;
        
      ELSE
        user_stat := 0;
    END CASE;
    
    user_stat := COALESCE(user_stat, 0);
    
    -- Check if achievement should be awarded
    IF user_stat >= achievement_record.requirement_value THEN
      -- Insert or update user achievement
      INSERT INTO public.user_achievements (user_id, achievement_id, progress, is_completed)
      VALUES (user_uuid, achievement_record.id, user_stat, true)
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET 
        progress = user_stat,
        is_completed = true,
        earned_at = now();
      
      -- Add XP reward
      PERFORM add_user_experience(user_uuid, achievement_record.xp_reward);
      
      -- Add keys reward
      IF achievement_record.keys_reward > 0 THEN
        UPDATE public.wallets 
        SET keys_balance = keys_balance + achievement_record.keys_reward
        WHERE user_id = user_uuid;
      END IF;
      
      -- Create achievement notification
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        user_uuid,
        'achievement_unlocked',
        'Achievement Unlocked! 🏆',
        format('You earned "%s" - %s', achievement_record.name, achievement_record.description),
        jsonb_build_object(
          'achievement_id', achievement_record.id,
          'achievement_name', achievement_record.name,
          'xp_reward', achievement_record.xp_reward,
          'keys_reward', achievement_record.keys_reward,
          'rarity', achievement_record.rarity
        )
      );
    ELSE
      -- Update progress if not completed
      INSERT INTO public.user_achievements (user_id, achievement_id, progress, is_completed)
      VALUES (user_uuid, achievement_record.id, user_stat, false)
      ON CONFLICT (user_id, achievement_id) 
      DO UPDATE SET 
        progress = user_stat;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle user action and trigger achievement checks
CREATE OR REPLACE FUNCTION public.handle_user_action(user_uuid UUID, action_type TEXT, increment_amount INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  -- Update daily usage
  PERFORM increment_daily_usage(user_uuid, action_type, increment_amount);
  
  -- Update streak if it's a discovery action
  IF action_type IN ('swipes', 'super_likes') THEN
    PERFORM update_user_streak(user_uuid);
  END IF;
  
  -- Check for achievements
  PERFORM check_and_award_achievements(user_uuid);
  
  -- Add base XP for actions
  CASE action_type
    WHEN 'swipes' THEN
      PERFORM add_user_experience(user_uuid, 5 * increment_amount);
    WHEN 'super_likes' THEN  
      PERFORM add_user_experience(user_uuid, 15 * increment_amount);
    WHEN 'matches' THEN
      PERFORM add_user_experience(user_uuid, 50 * increment_amount);
    ELSE
      PERFORM add_user_experience(user_uuid, 10 * increment_amount);
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;