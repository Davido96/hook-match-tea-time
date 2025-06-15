
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEarnings } from '@/hooks/useEarnings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Wallet {
  id: string;
  user_id: string;
  keys_balance: number;
}

export const useWallet = () => {
  const { user } = useAuth();
  const { recordEarning } = useEarnings();
  const { toast } = useToast();
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

    console.log('Starting tip transaction...', { recipientUserId, amount, senderBalance: wallet.keys_balance });

    try {
      // Get sender's profile for notification
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();

      const senderName = senderProfile?.name || 'Someone';

      // First, record the tip
      const { data: tipData, error: tipError } = await supabase
        .from('tips')
        .insert({
          sender_id: user.id,
          recipient_id: recipientUserId,
          amount,
          message: message || null
        })
        .select()
        .single();

      if (tipError) {
        console.error('Error creating tip record:', tipError);
        throw new Error('Failed to create tip record');
      }

      console.log('Tip record created successfully:', tipData);

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

      console.log('Sender wallet updated successfully');

      // Use the secure function to handle recipient wallet creation/update
      const { error: recipientError } = await supabase
        .rpc('create_or_update_recipient_wallet', {
          recipient_user_id: recipientUserId,
          tip_amount: amount
        });

      if (recipientError) {
        console.error('Error updating recipient wallet:', recipientError);
        throw new Error('Failed to update recipient wallet');
      }

      console.log('Recipient wallet updated successfully');

      // Create notification for recipient
      const { error: notificationError } = await supabase
        .rpc('create_tip_notification', {
          recipient_user_id: recipientUserId,
          sender_name: senderName,
          tip_amount: amount,
          tip_message: message || null
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the transaction for notification errors
      } else {
        console.log('Tip notification created successfully');
      }

      // Record earning for recipient
      await recordEarning({
        source_type: 'tip',
        source_id: tipData.id,
        amount,
        description: message ? `Tip: ${message}` : 'Tip received'
      });

      console.log('Earning recorded successfully');

      // Refresh sender's wallet
      await fetchWallet();
      
      console.log('Tip sent successfully');
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error sending tip:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to send tip. Please try again.';
      
      if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance to send this tip.';
      } else if (error.message?.includes('recipient')) {
        errorMessage = 'Unable to process tip for this recipient. Please try again.';
      } else if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      return { success: false, error: errorMessage };
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
