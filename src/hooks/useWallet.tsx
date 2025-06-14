
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

  const sendTip = async (recipientUserId: string, amount: number, message?: string) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    if (!wallet || wallet.keys_balance < amount) {
      return { success: false, error: 'Insufficient Keys balance' };
    }

    try {
      // Start a transaction-like operation
      // First, record the tip
      const { error: tipError } = await supabase
        .from('tips')
        .insert({
          sender_id: user.id,
          recipient_id: recipientUserId,
          amount,
          message: message || null
        });

      if (tipError) {
        console.error('Error creating tip record:', tipError);
        throw new Error('Failed to record tip');
      }

      // Deduct from sender's wallet
      const newSenderBalance = wallet.keys_balance - amount;
      const { error: senderWalletError } = await supabase
        .from('wallets')
        .update({ keys_balance: newSenderBalance })
        .eq('user_id', user.id);

      if (senderWalletError) {
        console.error('Error updating sender wallet:', senderWalletError);
        throw new Error('Failed to update sender balance');
      }

      // Get recipient's current balance
      const { data: recipientWallet, error: getRecipientError } = await supabase
        .from('wallets')
        .select('keys_balance')
        .eq('user_id', recipientUserId)
        .maybeSingle();

      if (getRecipientError) {
        console.error('Error getting recipient wallet:', getRecipientError);
        throw new Error('Failed to get recipient wallet');
      }

      // If recipient doesn't have a wallet, create one
      if (!recipientWallet) {
        const { error: createWalletError } = await supabase
          .from('wallets')
          .insert({ 
            user_id: recipientUserId, 
            keys_balance: amount 
          });

        if (createWalletError) {
          console.error('Error creating recipient wallet:', createWalletError);
          throw new Error('Failed to create recipient wallet');
        }
      } else {
        // Update recipient's wallet
        const newRecipientBalance = (recipientWallet.keys_balance || 0) + amount;
        const { error: recipientWalletError } = await supabase
          .from('wallets')
          .update({ keys_balance: newRecipientBalance })
          .eq('user_id', recipientUserId);

        if (recipientWalletError) {
          console.error('Error updating recipient wallet:', recipientWalletError);
          throw new Error('Failed to update recipient balance');
        }
      }

      // Refresh sender's wallet
      await fetchWallet();
      
      console.log('Tip sent successfully');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error sending tip:', error);
      return { success: false, error: error.message || 'Failed to send tip' };
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
