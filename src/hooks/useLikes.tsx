
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLikes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const validateUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const createLike = async (recipientId: string, isSuperLike: boolean = false) => {
    if (!user) {
      console.error('❌ User not authenticated');
      toast.error('Please log in to like profiles');
      return false;
    }

    // Validate recipient ID format
    if (!recipientId || typeof recipientId !== 'string') {
      console.error('❌ Invalid recipient ID:', recipientId);
      toast.error('Invalid user profile');
      return false;
    }

    // Check if recipient ID is a valid UUID
    if (!validateUUID(recipientId)) {
      console.error('❌ Recipient ID is not a valid UUID:', recipientId);
      toast.error('Invalid user profile format');
      return false;
    }

    // Validate sender ID
    if (!validateUUID(user.id)) {
      console.error('❌ Sender ID is not a valid UUID:', user.id);
      toast.error('Authentication error');
      return false;
    }

    try {
      console.log('💕 Creating like:', { 
        sender: user.id, 
        recipient: recipientId, 
        isSuperLike,
        senderValid: validateUUID(user.id),
        recipientValid: validateUUID(recipientId)
      });
      
      setLoading(true);

      // First, check if like already exists
      const { data: existingLike, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('sender_id', user.id)
        .eq('recipient_id', recipientId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        console.error('❌ Error checking existing like:', checkError);
        toast.error('Failed to check existing like');
        return false;
      }

      if (existingLike) {
        console.log('ℹ️ Like already exists');
        toast.info('You already liked this profile');
        return false;
      }

      // Create the like
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
        console.error('❌ Detailed Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Provide specific error messages based on error type
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You already liked this profile');
        } else if (error.code === '23503') { // Foreign key violation
          toast.error('User profile not found');
        } else if (error.code === '42501') { // Insufficient privilege
          toast.error('Permission denied - please log in again');
        } else {
          toast.error(`Failed to send ${isSuperLike ? 'super like' : 'like'}: ${error.message}`);
        }
        return false;
      }

      console.log('✅ Like created successfully:', data);
      toast.success(`${isSuperLike ? 'Super like' : 'Like'} sent successfully!`);
      return true;
    } catch (error) {
      console.error('❌ Unexpected error in createLike:', error);
      toast.error('Network error - please try again');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkMutualLike = async (recipientId: string) => {
    if (!user) {
      console.error('❌ User not authenticated for mutual like check');
      return false;
    }

    if (!validateUUID(recipientId) || !validateUUID(user.id)) {
      console.error('❌ Invalid UUIDs for mutual like check:', { user: user.id, recipient: recipientId });
      return false;
    }

    try {
      console.log('🔍 Checking mutual like between:', user.id, 'and', recipientId);
      
      // Check if both users have liked each other
      const { data, error } = await supabase
        .from('likes')
        .select('id, sender_id, recipient_id')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`);

      if (error) {
        console.error('❌ Error checking mutual like:', error);
        return false;
      }

      console.log('🔍 Mutual like check results:', data);
      const isMutualLike = data && data.length >= 2;
      
      if (isMutualLike) {
        console.log('🎉 Mutual like detected!');
      }

      return isMutualLike;
    } catch (error) {
      console.error('❌ Error in checkMutualLike:', error);
      return false;
    }
  };

  return {
    createLike,
    checkMutualLike,
    loading
  };
};
