
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePin = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const setPin = async (pin: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('set_withdrawal_pin', { pin });
      if (error) throw error;
      toast({
        title: 'PIN Set Successfully',
        description: 'Your withdrawal PIN has been set.',
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error setting PIN:', error);
      toast({
        title: 'Error Setting PIN',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async (pin: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_withdrawal_pin', { pin });
      if (error) throw error;
      return data; // returns boolean
    } catch (error: any) {
      console.error('Error verifying PIN:', error);
      // Don't toast here, let the caller decide
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { setPin, verifyPin, loading };
};
