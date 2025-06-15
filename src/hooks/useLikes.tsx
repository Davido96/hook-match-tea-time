
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useLikes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const createLike = async (recipientId: string, isSuperLike: boolean = false) => {
    if (!user) {
      console.log('User not authenticated');
      return false;
    }

    try {
      console.log('Creating like:', { sender: user.id, recipient: recipientId, isSuperLike });
      setLoading(true);

      const { data, error } = await supabase
        .from('likes')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          is_super_like: isSuperLike
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating like:', error);
        return false;
      }

      console.log('Like created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createLike:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkMutualLike = async (recipientId: string) => {
    if (!user) return false;

    try {
      // Check if both users have liked each other
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`);

      if (error) {
        console.error('Error checking mutual like:', error);
        return false;
      }

      return data && data.length >= 2; // Both users have liked each other
    } catch (error) {
      console.error('Error in checkMutualLike:', error);
      return false;
    }
  };

  return {
    createLike,
    checkMutualLike,
    loading
  };
};
