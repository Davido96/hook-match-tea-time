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
  const [error, setError] = useState<string | null>(null);

  const fetchCreatorPlans = async (creatorId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching subscription plans for creator:', creatorId);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .order('price_keys');

      if (error) {
        console.error('Error fetching creator plans:', error);
        setError('Failed to load subscription plans');
        throw error;
      }
      
      console.log('Successfully fetched plans:', data?.length || 0, 'plans found');
      
      if (!data || data.length === 0) {
        setError('No subscription plans available');
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('Final error fetching creator plans:', error);
      setError('Failed to load subscription plans');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching my subscription plans for user:', user.id);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_id', user.id)
        .order('duration_days');

      if (error) {
        console.error('Error fetching my plans:', error);
        setError('Failed to load your plans');
        throw error;
      }
      
      console.log('Successfully fetched my plans:', data?.length || 0, 'plans found');
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching my plans:', error);
      setError('Failed to load your plans');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Omit<SubscriptionPlan, 'id' | 'creator_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      setError('User not authenticated');
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Creating new subscription plan:', planData);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          creator_id: user.id,
          name: planData.name,
          duration_days: planData.duration_days,
          price_keys: planData.price_keys,
          is_active: planData.is_active
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        setError('Failed to create subscription plan');
        throw error;
      }
      
      console.log('Successfully created plan:', data);
      await fetchMyPlans();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating plan:', error);
      setError('Failed to create subscription plan');
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updatePlan = async (planId: string, updates: Partial<SubscriptionPlan>) => {
    try {
      console.log('Updating subscription plan:', planId, updates);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updates)
        .eq('id', planId)
        .eq('creator_id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan:', error);
        throw error;
      }
      
      console.log('Successfully updated plan:', data);
      await fetchMyPlans();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating plan:', error);
      return { data: null, error };
    }
  };

  const deletePlan = async (planId: string) => {
    try {
      console.log('Deleting subscription plan:', planId);
      
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: false })
        .eq('id', planId)
        .eq('creator_id', user?.id);

      if (error) {
        console.error('Error deleting plan:', error);
        throw error;
      }
      
      console.log('Successfully deleted plan:', planId);
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
    error,
    fetchCreatorPlans,
    fetchMyPlans,
    createPlan,
    updatePlan,
    deletePlan,
    clearError: () => setError(null)
  };
};
