-- Add premium discovery subscription tier to user_subscriptions
-- Add new columns to track premium discovery features
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS premium_features jsonb DEFAULT '{}'::jsonb;

-- Update existing tiers to include premium_discovery
UPDATE public.user_subscriptions 
SET premium_features = jsonb_build_object(
  'premium_discovery', CASE WHEN tier = 'premium_discovery' THEN true ELSE false END,
  'unlimited_swipes', CASE WHEN tier IN ('premium_discovery', 'vip', 'pro') THEN true ELSE false END,
  'unlimited_super_likes', CASE WHEN tier IN ('premium_discovery', 'vip') THEN true ELSE false END,
  'rewinds', CASE WHEN tier IN ('premium_discovery', 'vip', 'pro') THEN true ELSE false END,
  'boost', CASE WHEN tier IN ('premium_discovery', 'vip') THEN true ELSE false END,
  'premium_badge', CASE WHEN tier IN ('premium_discovery', 'vip', 'pro') THEN true ELSE false END,
  'who_liked_you', CASE WHEN tier IN ('premium_discovery', 'vip') THEN true ELSE false END,
  'advanced_filters', CASE WHEN tier IN ('premium_discovery', 'vip', 'pro') THEN true ELSE false END
)
WHERE premium_features = '{}'::jsonb OR premium_features IS NULL;

-- Add premium discovery limits to daily_usage table
ALTER TABLE public.daily_usage
ADD COLUMN IF NOT EXISTS rewinds_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS boosts_used integer NOT NULL DEFAULT 0;

-- Create function to check premium features
CREATE OR REPLACE FUNCTION public.get_user_premium_features(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  features jsonb;
BEGIN
  SELECT premium_features INTO features
  FROM public.user_subscriptions
  WHERE user_id = user_uuid 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY CASE tier
    WHEN 'vip' THEN 4
    WHEN 'premium_discovery' THEN 3
    WHEN 'pro' THEN 2
    WHEN 'basic' THEN 1
    WHEN 'free' THEN 0
    ELSE -1
  END DESC
  LIMIT 1;
  
  RETURN COALESCE(features, '{
    "premium_discovery": false,
    "unlimited_swipes": false,
    "unlimited_super_likes": false,
    "rewinds": false,
    "boost": false,
    "premium_badge": false,
    "who_liked_you": false,
    "advanced_filters": false
  }'::jsonb);
END;
$$;

-- Create function to get premium discovery limits
CREATE OR REPLACE FUNCTION public.get_premium_limits(user_uuid uuid)
RETURNS TABLE(
  daily_swipes integer,
  daily_super_likes integer,
  daily_rewinds integer,
  daily_boosts integer,
  can_see_likes boolean,
  has_premium_badge boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier TEXT;
  features jsonb;
BEGIN
  -- Get user tier and premium features
  SELECT tier, premium_features INTO user_tier, features
  FROM public.user_subscriptions
  WHERE user_id = user_uuid 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY CASE tier
    WHEN 'vip' THEN 4
    WHEN 'premium_discovery' THEN 3
    WHEN 'pro' THEN 2
    WHEN 'basic' THEN 1
    WHEN 'free' THEN 0
    ELSE -1
  END DESC
  LIMIT 1;
  
  user_tier := COALESCE(user_tier, 'free');
  features := COALESCE(features, '{}'::jsonb);
  
  -- Return limits based on tier
  RETURN QUERY SELECT
    CASE 
      WHEN user_tier IN ('premium_discovery', 'vip', 'pro') THEN 999999 -- Unlimited
      WHEN user_tier = 'basic' THEN 100
      ELSE 50 -- free tier
    END as daily_swipes,
    
    CASE 
      WHEN user_tier IN ('premium_discovery', 'vip') THEN 999999 -- Unlimited
      WHEN user_tier IN ('pro', 'basic') THEN 10
      ELSE 3 -- free tier
    END as daily_super_likes,
    
    CASE 
      WHEN user_tier IN ('premium_discovery', 'vip', 'pro') THEN 10
      ELSE 0 -- free/basic tier
    END as daily_rewinds,
    
    CASE 
      WHEN user_tier IN ('premium_discovery', 'vip') THEN 3
      ELSE 0 -- free/basic/pro tier
    END as daily_boosts,
    
    COALESCE((features->>'who_liked_you')::boolean, false) as can_see_likes,
    COALESCE((features->>'premium_badge')::boolean, false) as has_premium_badge;
END;
$$;