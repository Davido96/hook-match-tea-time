
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
      console.log('Fetching subscription plans for creator:', creatorId);
      
      // Add retry logic with exponential backoff
      let retries = 3;
      let data = null;
      
      while (retries > 0 && !data) {
        const { data: fetchedData, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('creator_id', creatorId)
          .eq('is_active', true)
          .order('price_keys');

        if (error) {
          console.error(`Error fetching creator plans (attempt ${4 - retries}):`, error);
          if (retries === 1) {
            throw error;
          }
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          data = fetchedData;
          console.log('Successfully fetched plans:', data?.length || 0, 'plans found');
        }
      }
      
      return data || [];
    } catch (error) {
      console.error('Final error fetching creator plans:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPlans = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching my subscription plans for user:', user.id);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('creator_id', user.id)
        .order('duration_days');

      if (error) {
        console.error('Error fetching my plans:', error);
        throw error;
      }
      
      console.log('Successfully fetched my plans:', data?.length || 0, 'plans found');
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
      console.log('Creating new subscription plan:', planData);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          creator_id: user.id,
          ...planData
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        throw error;
      }
      
      console.log('Successfully created plan:', data);
      await fetchMyPlans();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating plan:', error);
      return { data: null, error };
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
    fetchCreatorPlans,
    fetchMyPlans,
    createPlan,
    updatePlan,
    deletePlan
  };
};
