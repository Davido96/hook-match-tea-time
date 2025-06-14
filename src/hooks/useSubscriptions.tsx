import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { useEarnings } from '@/hooks/useEarnings';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptions = () => {
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const { recordEarning } = useEarnings();
  const [loading, setLoading] = useState(false);

  const subscribeToCreator = async (creatorId: string, planId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('creator_id', creatorId)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      throw new Error('Invalid subscription plan');
    }

    // Check if user has enough balance
    if (!wallet || wallet.keys_balance < plan.price_keys) {
      throw new Error('Insufficient balance');
    }

    setLoading(true);
    try {
      // Check if already subscribed
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', user.id)
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (existingSubscription) {
        throw new Error('Already subscribed to this creator');
      }

      // Calculate expiry date based on plan duration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration_days);

      // Create subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          creator_id: creatorId,
          subscription_plan_id: planId,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Deduct from subscriber's wallet
      const newBalance = wallet.keys_balance - plan.price_keys;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ keys_balance: newBalance })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Add to creator's wallet
      const { data: creatorWallet, error: getCreatorWalletError } = await supabase
        .from('wallets')
        .select('keys_balance')
        .eq('user_id', creatorId)
        .maybeSingle();

      if (getCreatorWalletError) throw getCreatorWalletError;

      if (!creatorWallet) {
        // Create wallet for creator if it doesn't exist
        const { error: createWalletError } = await supabase
          .from('wallets')
          .insert({ 
            user_id: creatorId, 
            keys_balance: plan.price_keys 
          });

        if (createWalletError) throw createWalletError;
      } else {
        const { error: updateCreatorWalletError } = await supabase
          .from('wallets')
          .update({ keys_balance: (creatorWallet?.keys_balance || 0) + plan.price_keys })
          .eq('user_id', creatorId);

        if (updateCreatorWalletError) throw updateCreatorWalletError;
      }

      // Record earning for creator
      await recordEarning({
        source_type: 'subscription',
        source_id: subscription.id,
        amount: plan.price_keys,
        description: `Subscription: ${plan.name}`
      });

      // Refresh wallet data
      await refetchWallet();

      console.log('Successfully subscribed to creator');
    } catch (error) {
      console.error('Error subscribing to creator:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromCreator = async (creatorId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_active: false })
        .eq('subscriber_id', user.id)
        .eq('creator_id', creatorId);

      if (error) throw error;
      console.log('Successfully unsubscribed from creator');
    } catch (error) {
      console.error('Error unsubscribing from creator:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = async (creatorId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('subscriber_id', user.id)
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  };

  const getUserSubscriptions = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles!subscriptions_creator_id_fkey (
            name,
            avatar_url,
            user_type
          ),
          subscription_plans (
            name,
            duration_days,
            price_keys
          )
        `)
        .eq('subscriber_id', user.id)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  };

  const getSubscriptionCount = async (creatorId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString());

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting subscription count:', error);
      return 0;
    }
  };

  return {
    subscribeToCreator,
    unsubscribeFromCreator,
    isSubscribed,
    getUserSubscriptions,
    getSubscriptionCount,
    loading
  };
};
