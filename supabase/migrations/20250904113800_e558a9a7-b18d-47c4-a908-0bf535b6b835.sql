-- Fix security issues for gamification functions by setting search_path = public
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(level_num INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- XP required increases by 100 per level (100, 200, 300, etc.)
  RETURN level_num * 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;