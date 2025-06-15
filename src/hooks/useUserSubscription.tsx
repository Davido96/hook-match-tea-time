
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserSubscription {
  id: string;
  user_id: string;
  tier: 'free' | 'basic' | 'pro' | 'vip';
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  keys_paid: number;
}

interface DailyUsage {
  swipes_used: number;
  super_likes_used: number;
  rewinds_used: number;
  message_credits_used: number;
}

export const useUserSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    swipes_used: 0,
    super_likes_used: 0,
    rewinds_used: 0,
    message_credits_used: 0
  });
  const [loading, setLoading] = useState(true);

  const tierLimits = {
    free: {
      daily_swipes: 10,
      daily_super_likes: 0,
      daily_rewinds: 0,
      can_see_likes: false,
      advanced_filters: false,
      unlimited_photos: false
    },
    basic: {
      daily_swipes: -1, // unlimited
      daily_super_likes: 5,
      daily_rewinds: 3,
      can_see_likes: true,
      advanced_filters: true,
      unlimited_photos: true
    },
    pro: {
      daily_swipes: -1,
      daily_super_likes: -1, // unlimited
      daily_rewinds: -1,
      can_see_likes: true,
      advanced_filters: true,
      unlimited_photos: true
    },
    vip: {
      daily_swipes: -1,
      daily_super_likes: -1,
      daily_rewinds: -1,
      can_see_likes: true,
      advanced_filters: true,
      unlimited_photos: true
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
      fetchDailyUsage();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return;
      }

      if (data) {
        // Type assertion to ensure tier is properly typed
        const typedSubscription: UserSubscription = {
          ...data,
          tier: data.tier as 'free' | 'basic' | 'pro' | 'vip'
        };
        setSubscription(typedSubscription);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyUsage = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily usage:', error);
        return;
      }

      if (data) {
        setDailyUsage({
          swipes_used: data.swipes_used,
          super_likes_used: data.super_likes_used,
          rewinds_used: data.rewinds_used,
          message_credits_used: data.message_credits_used
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const canPerformAction = (actionType: 'swipes' | 'super_likes' | 'rewinds' | 'message_credits') => {
    if (!subscription) return false;

    const limits = tierLimits[subscription.tier];
    const currentUsage = dailyUsage[`${actionType}_used` as keyof DailyUsage];

    // -1 means unlimited
    if (limits[`daily_${actionType}` as keyof typeof limits] === -1) return true;
    
    return currentUsage < (limits[`daily_${actionType}` as keyof typeof limits] as number);
  };

  const incrementUsage = async (actionType: 'swipes' | 'super_likes' | 'rewinds' | 'message_credits') => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('increment_daily_usage', {
        user_uuid: user.id,
        action_type: actionType,
        increment_amount: 1
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      // Update local state
      setDailyUsage(prev => ({
        ...prev,
        [`${actionType}_used`]: prev[`${actionType}_used` as keyof DailyUsage] + 1
      }));

      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const upgradeTier = async (newTier: 'basic' | 'pro' | 'vip', keysCost: number) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Check if user has enough keys
      const { data: walletData } = await supabase
        .from('wallets')
        .select('keys_balance')
        .eq('user_id', user.id)
        .single();

      if (!walletData || walletData.keys_balance < keysCost) {
        return { success: false, error: 'Insufficient Keys balance' };
      }

      // Calculate expiry date based on tier
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // 1 month subscription

      // Deactivate current subscription
      if (subscription) {
        await supabase
          .from('user_subscriptions')
          .update({ is_active: false })
          .eq('id', subscription.id);
      }

      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          tier: newTier,
          expires_at: expiryDate.toISOString(),
          keys_paid: keysCost,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        return { success: false, error: 'Failed to upgrade subscription' };
      }

      // Deduct keys from wallet
      await supabase
        .from('wallets')
        .update({ 
          keys_balance: walletData.keys_balance - keysCost 
        })
        .eq('user_id', user.id);

      // Type assertion for the new subscription
      const typedSubscription: UserSubscription = {
        ...data,
        tier: data.tier as 'free' | 'basic' | 'pro' | 'vip'
      };
      setSubscription(typedSubscription);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error upgrading tier:', error);
      return { success: false, error: 'Failed to upgrade subscription' };
    }
  };

  const getCurrentTier = () => subscription?.tier || 'free';
  const getTierLimits = () => tierLimits[getCurrentTier()];

  return {
    subscription,
    dailyUsage,
    loading,
    canPerformAction,
    incrementUsage,
    upgradeTier,
    getCurrentTier,
    getTierLimits,
    refetch: () => {
      fetchUserSubscription();
      fetchDailyUsage();
    }
  };
};
