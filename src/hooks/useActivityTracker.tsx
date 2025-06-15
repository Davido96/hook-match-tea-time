
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ActivityData {
  currentStreak: number;
  longestStreak: number;
  totalDiscoveryDays: number;
  lastActiveDate: string;
}

export const useActivityTracker = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState<ActivityData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDiscoveryDays: 0,
    lastActiveDate: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching activity:', error);
        return;
      }

      if (data) {
        setActivity({
          currentStreak: data.current_streak_days,
          longestStreak: data.longest_streak_days,
          totalDiscoveryDays: data.total_discovery_days,
          lastActiveDate: data.last_active_date
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_user_streak', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error updating streak:', error);
        return;
      }

      // Refresh activity data
      await fetchActivity();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivity();
    } else {
      setActivity({
        currentStreak: 0,
        longestStreak: 0,
        totalDiscoveryDays: 0,
        lastActiveDate: ''
      });
      setLoading(false);
    }
  }, [user]);

  return {
    activity,
    loading,
    updateStreak,
    refetch: fetchActivity
  };
};
