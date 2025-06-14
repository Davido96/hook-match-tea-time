
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';

export const useSubscriptions = () => {
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const subscribeToCreator = async (creatorId: string, subscriptionFee: number) => {
    if (!user) throw new Error('User not authenticated');
    
    // Check if user has enough balance
    if (!wallet || wallet.keys_balance < subscriptionFee) {
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

      // Calculate expiry date (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Create subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          creator_id: creatorId,
          expires_at: expiresAt.toISOString(),
          is_active: true
        })
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Deduct from subscriber's wallet
      const newBalance = wallet.keys_balance - subscriptionFee;
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
        .single();

      if (getCreatorWalletError) throw getCreatorWalletError;

      const { error: updateCreatorWalletError } = await supabase
        .from('wallets')
        .update({ keys_balance: (creatorWallet?.keys_balance || 0) + subscriptionFee })
        .eq('user_id', creatorId);

      if (updateCreatorWalletError) throw updateCreatorWalletError;

      // Record the earning
      const { error: earningError } = await supabase
        .from('earnings')
        .insert({
          creator_id: creatorId,
          subscriber_id: user.id,
          amount: subscriptionFee,
          source: 'subscription',
          reference_id: subscription.id
        });

      if (earningError) console.error('Error recording earning:', earningError);

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
            user_type,
            subscription_fee
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
