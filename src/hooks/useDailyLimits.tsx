
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDailyLimits = () => {
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserTier();
    }
  }, [user]);

  const fetchUserTier = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_tier', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching user tier:', error);
        return;
      }

      setUserTier(data || 'free');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDailyLimit = async (actionType: string, limitAmount: number) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_daily_limit', {
        user_uuid: user.id,
        action_type: actionType,
        limit_amount: limitAmount
      });

      if (error) {
        console.error('Error checking daily limit:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const incrementDailyUsage = async (actionType: string, incrementAmount: number = 1) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('increment_daily_usage', {
        user_uuid: user.id,
        action_type: actionType,
        increment_amount: incrementAmount
      });

      if (error) {
        console.error('Error incrementing usage:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return {
    userTier,
    loading,
    checkDailyLimit,
    incrementDailyUsage,
    refetch: fetchUserTier
  };
};
