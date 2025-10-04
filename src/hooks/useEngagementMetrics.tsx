import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EngagementMetrics {
  total_users: number;
  active_users: number;
  engagement_rate: number;
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_matches: number;
  avg_posts_per_user: number;
}

export const useEngagementMetrics = (periodDays: number = 30) => {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_engagement_metrics', {
        period_days: periodDays,
      });

      if (error) throw error;
      setMetrics(data as unknown as EngagementMetrics);
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [periodDays]);

  return {
    metrics,
    loading,
    refetch: fetchMetrics,
  };
};
