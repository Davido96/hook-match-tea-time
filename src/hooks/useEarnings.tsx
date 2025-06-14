
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Earning {
  id: string;
  user_id: string;
  source_type: 'subscription' | 'tip' | 'bonus';
  source_id?: string;
  amount: number;
  description?: string;
  created_at: string;
}

interface EarningsSummary {
  total: number;
  subscription_earnings: number;
  tip_earnings: number;
  bonus_earnings: number;
  recent_earnings: Earning[];
}

export const useEarnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEarnings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const earningsData = data || [];
      setEarnings(earningsData);

      // Calculate summary
      const total = earningsData.reduce((sum, earning) => sum + earning.amount, 0);
      const subscription_earnings = earningsData
        .filter(e => e.source_type === 'subscription')
        .reduce((sum, earning) => sum + earning.amount, 0);
      const tip_earnings = earningsData
        .filter(e => e.source_type === 'tip')
        .reduce((sum, earning) => sum + earning.amount, 0);
      const bonus_earnings = earningsData
        .filter(e => e.source_type === 'bonus')
        .reduce((sum, earning) => sum + earning.amount, 0);

      setSummary({
        total,
        subscription_earnings,
        tip_earnings,
        bonus_earnings,
        recent_earnings: earningsData.slice(0, 10)
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordEarning = async (earningData: Omit<Earning, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('earnings')
        .insert({
          user_id: user.id,
          ...earningData
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchEarnings();
      return { data, error: null };
    } catch (error) {
      console.error('Error recording earning:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchEarnings();
    }
  }, [user]);

  return {
    earnings,
    summary,
    loading,
    fetchEarnings,
    recordEarning
  };
};
