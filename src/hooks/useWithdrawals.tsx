import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  requested_at: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
}

export const useWithdrawals = () => {
  const { user } = useAuth();
  const { wallet, refetch: refetchWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const requestWithdrawal = async (request: WithdrawalRequest) => {
    if (!user) throw new Error('User not authenticated');
    
    if (!wallet || wallet.keys_balance < request.amount) {
      throw new Error('Insufficient balance');
    }

    if (request.amount < 1000) {
      throw new Error('Minimum withdrawal amount is 1000 Keys');
    }

    setLoading(true);
    try {
      // For now, we'll simulate the withdrawal request since the table isn't in types yet
      // In a real implementation, this would:
      // 1. Insert withdrawal request into withdrawals table
      // 2. Deduct amount from user's wallet (held pending approval)
      // 3. Send notification to admin for approval

      console.log('Withdrawal request submitted:', {
        userId: user.id,
        amount: request.amount,
        bankName: request.bankName,
        accountNumber: request.accountNumber,
        accountName: request.accountName,
        notes: request.notes
      });

      // For demo purposes, we'll just show success
      // In real implementation, remove this comment and implement actual withdrawal logic
      
      return { error: null };
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const getUserWithdrawals = async (): Promise<Withdrawal[]> => {
    if (!user) return [];
    
    try {
      // Placeholder - in real implementation this would fetch from withdrawals table
      console.log('Fetching withdrawals for user:', user.id);
      return [];
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      return [];
    }
  };

  const getTotalEarnings = async (): Promise<number> => {
    if (!user) return 0;
    
    try {
      // Placeholder - in real implementation this would sum from earnings table
      console.log('Calculating total earnings for user:', user.id);
      return 0;
    } catch (error) {
      console.error('Error calculating total earnings:', error);
      return 0;
    }
  };

  const getAvailableBalance = (): number => {
    return wallet?.keys_balance || 0;
  };

  return {
    requestWithdrawal,
    getUserWithdrawals,
    getTotalEarnings,
    getAvailableBalance,
    loading
  };
};
