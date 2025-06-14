
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  creator_id: string;
  name: string;
  duration_days: number;
  price_keys: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSubscriptionPlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCreatorPlans = async (creatorId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .order('price_keys');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching creator plans:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_id', user.id)
        .order('duration_days');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching my plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<SubscriptionPlan, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          creator_id: user.id,
          ...planData
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchMyPlans();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating plan:', error);
      return { data: null, error };
    }
  };

  const updatePlan = async (planId: string, updates: Partial<SubscriptionPlan>) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', planId)
        .eq('creator_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchMyPlans();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating plan:', error);
      return { data: null, error };
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', planId)
        .eq('creator_id', user?.id);

      if (error) throw error;
      
      await fetchMyPlans();
      return { error: null };
    } catch (error) {
      console.error('Error deleting plan:', error);
      return { error };
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyPlans();
    }
  }, [user]);

  return {
    plans,
    loading,
    fetchCreatorPlans,
    fetchMyPlans,
    createPlan,
    updatePlan,
    deletePlan
  };
};
