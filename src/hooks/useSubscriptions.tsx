
import { useState } from 'react';
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
      // Calculate expiry date (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Create subscription
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          subscriber_id: user.id,
          creator_id: creatorId,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      if (subscriptionError) throw subscriptionError;

      // Deduct from wallet
      const newBalance = wallet.keys_balance - subscriptionFee;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ keys_balance: newBalance })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

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
          )
        `)
        .eq('subscriber_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  };

  return {
    subscribeToCreator,
    unsubscribeFromCreator,
    isSubscribed,
    getUserSubscriptions,
    loading
  };
};
