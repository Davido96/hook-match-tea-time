
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';

interface WithdrawalRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
}

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bank_name: string;
  account_number: string;
  account_name: string;
  requested_at: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useWithdrawals = () => {
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const requestWithdrawal = async (withdrawalData: WithdrawalRequest) => {
    if (!user) throw new Error('User not authenticated');
    
    // Check if user has enough balance
    if (!wallet || wallet.keys_balance < withdrawalData.amount) {
      throw new Error('Insufficient balance');
    }

    // Minimum withdrawal amount check
    if (withdrawalData.amount < 1000) {
      throw new Error('Minimum withdrawal amount is 1000 Keys');
    }

    setLoading(true);
    try {
      // Create withdrawal request
      const { data, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawalData.amount,
          bank_name: withdrawalData.bankName,
          account_number: withdrawalData.accountNumber,
          account_name: withdrawalData.accountName,
          notes: withdrawalData.notes,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Deduct amount from wallet (held in pending)
      const newBalance = wallet.keys_balance - withdrawalData.amount;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ keys_balance: newBalance })
        .eq('user_id', user.id);

      if (walletError) {
        // Rollback withdrawal request if wallet update fails
        await supabase.from('withdrawals').delete().eq('id', data.id);
        throw walletError;
      }

      // Refresh wallet data
      await refetchWallet();

      console.log('Withdrawal requested successfully');
      return { data, error: null };
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const getUserWithdrawals = async (): Promise<Withdrawal[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      return [];
    }
  };

  const getTotalEarnings = async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('amount')
        .eq('creator_id', user.id);

      if (error) throw error;
      
      const total = data?.reduce((sum, earning) => sum + earning.amount, 0) || 0;
      return total;
    } catch (error) {
      console.error('Error fetching total earnings:', error);
      return 0;
    }
  };

  const getPendingWithdrawals = async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('amount')
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      
      const total = data?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0;
      return total;
    } catch (error) {
      console.error('Error fetching pending withdrawals:', error);
      return 0;
    }
  };

  return {
    requestWithdrawal,
    getUserWithdrawals,
    getTotalEarnings,
    getPendingWithdrawals,
    loading
  };
};
