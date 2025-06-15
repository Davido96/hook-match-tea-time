
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DailyStats {
  todaySwipes: number;
  todayMatches: number;
  todaySuperLikes: number;
  currentStreak: number;
  longestStreak: number;
  totalDiscoveryDays: number;
}

export const useDailyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats>({
    todaySwipes: 0,
    todayMatches: 0,
    todaySuperLikes: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalDiscoveryDays: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDailyStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_daily_stats', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching daily stats:', error);
        return;
      }

      if (data && data.length > 0) {
        const statsData = data[0];
        setStats({
          todaySwipes: statsData.today_swipes,
          todayMatches: statsData.today_matches,
          todaySuperLikes: statsData.today_super_likes,
          currentStreak: statsData.current_streak,
          longestStreak: statsData.longest_streak,
          totalDiscoveryDays: statsData.total_discovery_days
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementSwipes = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('increment_daily_usage', {
        user_uuid: user.id,
        action_type: 'swipes',
        increment_amount: 1
      });

      if (error) {
        console.error('Error incrementing swipes:', error);
        return;
      }

      // Optimistically update local state
      setStats(prev => ({
        ...prev,
        todaySwipes: prev.todaySwipes + 1
      }));

      // Refresh full stats
      await fetchDailyStats();
    } catch (error) {
      console.error('Error incrementing swipes:', error);
    }
  };

  const incrementSuperLikes = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('increment_daily_usage', {
        user_uuid: user.id,
        action_type: 'super_likes',
        increment_amount: 1
      });

      if (error) {
        console.error('Error incrementing super likes:', error);
        return;
      }

      // Optimistically update local state
      setStats(prev => ({
        ...prev,
        todaySuperLikes: prev.todaySuperLikes + 1
      }));

      // Refresh full stats
      await fetchDailyStats();
    } catch (error) {
      console.error('Error incrementing super likes:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDailyStats();
    } else {
      setStats({
        todaySwipes: 0,
        todayMatches: 0,
        todaySuperLikes: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalDiscoveryDays: 0
      });
      setLoading(false);
    }
  }, [user]);

  return {
    stats,
    loading,
    incrementSwipes,
    incrementSuperLikes,
    refetch: fetchDailyStats
  };
};
