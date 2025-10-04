-- Create function to get revenue analytics breakdown
CREATE OR REPLACE FUNCTION public.get_revenue_analytics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  source_type TEXT,
  total_amount BIGINT,
  transaction_count BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_revenue BIGINT;
BEGIN
  -- Calculate total revenue for percentage
  SELECT COALESCE(SUM(amount), 0) INTO total_revenue
  FROM public.earnings
  WHERE (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at <= end_date);
  
  -- Return breakdown by source type
  RETURN QUERY
  SELECT 
    e.source_type::TEXT,
    COALESCE(SUM(e.amount), 0)::BIGINT as total_amount,
    COUNT(*)::BIGINT as transaction_count,
    CASE 
      WHEN total_revenue > 0 THEN ROUND((COALESCE(SUM(e.amount), 0)::NUMERIC / total_revenue::NUMERIC) * 100, 2)
      ELSE 0
    END as percentage
  FROM public.earnings e
  WHERE (start_date IS NULL OR e.created_at >= start_date)
    AND (end_date IS NULL OR e.created_at <= end_date)
  GROUP BY e.source_type
  ORDER BY total_amount DESC;
END;
$$;

-- Create function to get top earners
CREATE OR REPLACE FUNCTION public.get_top_earners(
  period_days INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  creator_name TEXT,
  avatar_url TEXT,
  user_type TEXT,
  total_earnings BIGINT,
  tips_earnings BIGINT,
  subscription_earnings BIGINT,
  ppv_earnings BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.user_id,
    p.name as creator_name,
    p.avatar_url,
    p.user_type,
    COALESCE(SUM(e.amount), 0)::BIGINT as total_earnings,
    COALESCE(SUM(CASE WHEN e.source_type = 'tip' THEN e.amount ELSE 0 END), 0)::BIGINT as tips_earnings,
    COALESCE(SUM(CASE WHEN e.source_type = 'subscription' THEN e.amount ELSE 0 END), 0)::BIGINT as subscription_earnings,
    COALESCE(SUM(CASE WHEN e.source_type = 'ppv' THEN e.amount ELSE 0 END), 0)::BIGINT as ppv_earnings
  FROM public.earnings e
  JOIN public.profiles p ON p.user_id = e.user_id
  WHERE e.created_at >= now() - (period_days || ' days')::interval
  GROUP BY e.user_id, p.name, p.avatar_url, p.user_type
  ORDER BY total_earnings DESC
  LIMIT limit_count;
END;
$$;

-- Create function to get monthly revenue trend
CREATE OR REPLACE FUNCTION public.get_monthly_revenue_trend(months_count INTEGER DEFAULT 12)
RETURNS TABLE (
  month_date DATE,
  month_label TEXT,
  total_revenue BIGINT,
  tips BIGINT,
  subscriptions BIGINT,
  ppv BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE_TRUNC('month', e.created_at)::DATE as month_date,
    TO_CHAR(DATE_TRUNC('month', e.created_at), 'Mon YYYY') as month_label,
    COALESCE(SUM(e.amount), 0)::BIGINT as total_revenue,
    COALESCE(SUM(CASE WHEN e.source_type = 'tip' THEN e.amount ELSE 0 END), 0)::BIGINT as tips,
    COALESCE(SUM(CASE WHEN e.source_type = 'subscription' THEN e.amount ELSE 0 END), 0)::BIGINT as subscriptions,
    COALESCE(SUM(CASE WHEN e.source_type = 'ppv' THEN e.amount ELSE 0 END), 0)::BIGINT as ppv
  FROM public.earnings e
  WHERE e.created_at >= now() - (months_count || ' months')::interval
  GROUP BY DATE_TRUNC('month', e.created_at)
  ORDER BY month_date DESC;
END;
$$;

-- Create function to get engagement metrics
CREATE OR REPLACE FUNCTION public.get_engagement_metrics(period_days INTEGER DEFAULT 30)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  total_users INTEGER;
  active_users INTEGER;
  total_posts INTEGER;
  total_likes INTEGER;
  total_comments INTEGER;
  total_matches INTEGER;
BEGIN
  -- Get total users
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  
  -- Get active users (logged in during period)
  SELECT COUNT(DISTINCT user_id) INTO active_users
  FROM public.user_presence
  WHERE last_seen >= now() - (period_days || ' days')::interval;
  
  -- Get total posts in period
  SELECT COUNT(*) INTO total_posts
  FROM public.exclusive_posts
  WHERE created_at >= now() - (period_days || ' days')::interval;
  
  -- Get total likes in period
  SELECT COUNT(*) INTO total_likes
  FROM public.likes
  WHERE created_at >= now() - (period_days || ' days')::interval;
  
  -- Get total comments in period
  SELECT COUNT(*) INTO total_comments
  FROM public.post_comments
  WHERE created_at >= now() - (period_days || ' days')::interval;
  
  -- Get total matches in period
  SELECT COUNT(*) INTO total_matches
  FROM public.matches
  WHERE created_at >= now() - (period_days || ' days')::interval;
  
  -- Build JSON result
  result := json_build_object(
    'total_users', total_users,
    'active_users', active_users,
    'engagement_rate', CASE WHEN total_users > 0 THEN ROUND((active_users::NUMERIC / total_users::NUMERIC) * 100, 2) ELSE 0 END,
    'total_posts', total_posts,
    'total_likes', total_likes,
    'total_comments', total_comments,
    'total_matches', total_matches,
    'avg_posts_per_user', CASE WHEN active_users > 0 THEN ROUND(total_posts::NUMERIC / active_users::NUMERIC, 2) ELSE 0 END
  );
  
  RETURN result;
END;
$$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON public.earnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_user_source ON public.earnings(user_id, source_type, created_at);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON public.tips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(is_active, created_at);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON public.user_presence(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_exclusive_posts_created ON public.exclusive_posts(created_at DESC);