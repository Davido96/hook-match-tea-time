
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { useEarnings } from '@/hooks/useEarnings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Withdrawal {
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
  admin_notes?: string;
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
  const { summary } = useEarnings();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);

  const fetchWithdrawals = async () => {
    if (!user) return;
    
    setWithdrawalsLoading(true);
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch withdrawal history",
        variant: "destructive"
      });
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
    }
  }, [user]);

  const requestWithdrawal = async (request: WithdrawalRequest) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (!wallet || wallet.keys_balance < request.amount) {
      throw new Error('Insufficient balance');
    }

    if (request.amount < 1000) {
      throw new Error('Minimum withdrawal amount is 1000 Keys');
    }

    setLoading(true);
    try {
      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: request.amount,
          bank_name: request.bankName.trim(),
          account_number: request.accountNumber.trim(),
          account_name: request.accountName.trim(),
          notes: request.notes?.trim() || null,
          status: 'pending'
        })
        .select()
        .single();

      if (withdrawalError) {
        throw withdrawalError;
      }

      // Update wallet balance (put withdrawal amount on hold)
      const newBalance = wallet.keys_balance - request.amount;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ keys_balance: newBalance })
        .eq('user_id', user.id);

      if (walletError) {
        throw walletError;
      }

      // Refresh data
      await Promise.all([
        refetchWallet(),
        fetchWithdrawals()
      ]);

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully. It will be processed within 1-3 business days."
      });

      return { data: withdrawal, error: null };
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Failed to request withdrawal. Please try again.",
        variant: "destructive"
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const getTotalEarnings = (): number => {
    return summary?.total || 0;
  };

  const getAvailableBalance = (): number => {
    return wallet?.keys_balance || 0;
  };

  const getPendingWithdrawals = (): number => {
    return withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);
  };

  return {
    requestWithdrawal,
    withdrawals,
    fetchWithdrawals,
    getTotalEarnings,
    getAvailableBalance,
    getPendingWithdrawals,
    loading,
    withdrawalsLoading
  };
};
