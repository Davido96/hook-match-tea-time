
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

  // Constants for withdrawal calculations
  const WITHDRAWAL_FEE_PERCENTAGE = 0.1; // 10%
  const MINIMUM_WITHDRAWAL = 100; // 100 Keys
  const KEYS_TO_NAIRA_RATE = 1000; // 1 Key = ₦1000

  const calculateWithdrawalFee = (amount: number): number => {
    return Math.round(amount * WITHDRAWAL_FEE_PERCENTAGE);
  };

  const calculateNetAmount = (amount: number): number => {
    return amount - calculateWithdrawalFee(amount);
  };

  const convertKeysToNaira = (keys: number): number => {
    return keys * KEYS_TO_NAIRA_RATE;
  };

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
      
      // Type assertion to ensure status matches our expected union type
      const typedWithdrawals = (data || []).map(withdrawal => ({
        ...withdrawal,
        status: withdrawal.status as 'pending' | 'approved' | 'rejected' | 'completed'
      }));
      
      setWithdrawals(typedWithdrawals);
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

    if (request.amount < MINIMUM_WITHDRAWAL) {
      throw new Error(`Minimum withdrawal amount is ${MINIMUM_WITHDRAWAL} Keys`);
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

      const netAmount = calculateNetAmount(request.amount);
      const netAmountNaira = convertKeysToNaira(netAmount);

      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal request for ${request.amount} Keys (₦${convertKeysToNaira(request.amount).toLocaleString()}) has been submitted. You will receive ₦${netAmountNaira.toLocaleString()} after 10% fee within 24 hours.`
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
    calculateWithdrawalFee,
    calculateNetAmount,
    convertKeysToNaira,
    MINIMUM_WITHDRAWAL,
    WITHDRAWAL_FEE_PERCENTAGE,
    loading,
    withdrawalsLoading
  };
};
