
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Wallet {
  id: string;
  user_id: string;
  keys_balance: number;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWallet();
    } else {
      setWallet(null);
      setLoading(false);
    }
  }, [user]);

  const fetchWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching wallet:', error);
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseKeys = async (amount: number) => {
    // Simulate key purchase - in real app, integrate with payment processor
    try {
      const newBalance = (wallet?.keys_balance || 0) + amount;
      const { data, error } = await supabase
        .from('wallets')
        .update({ keys_balance: newBalance })
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) throw error;
      setWallet(data);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  };

  const sendTip = async (recipientId: string, amount: number, message?: string) => {
    try {
      if (!wallet || wallet.keys_balance < amount) {
        throw new Error('Insufficient Keys balance');
      }

      // Deduct from sender's wallet
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ keys_balance: wallet.keys_balance - amount })
        .eq('user_id', user!.id);

      if (walletError) throw walletError;

      // Record the tip
      const { error: tipError } = await supabase
        .from('tips')
        .insert({
          sender_id: user!.id,
          recipient_id: recipientId,
          amount,
          message
        });

      if (tipError) throw tipError;

      // Update recipient's wallet
      const { error: recipientError } = await supabase.rpc('increment_wallet_balance', {
        user_id: recipientId,
        amount: amount
      });

      if (recipientError) throw recipientError;

      // Refresh wallet
      await fetchWallet();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    wallet,
    loading,
    purchaseKeys,
    sendTip,
    refetch: fetchWallet
  };
};
