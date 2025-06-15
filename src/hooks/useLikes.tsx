
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useLikes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const validateUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const createLike = async (recipientId: string, isSuperLike: boolean = false, retryCount: number = 0): Promise<boolean> => {
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

    // Debounce rapid like attempts
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    return new Promise((resolve) => {
      debounceRef.current = setTimeout(async () => {
        try {
          console.log('💕 Creating like:', { 
            sender: user.id, 
            recipient: recipientId, 
            isSuperLike,
            retryAttempt: retryCount
          });
          
          setLoading(true);

          // More robust check for existing like using the new index
          const { data: existingLike, error: checkError } = await supabase
            .from('likes')
            .select('id, created_at')
            .eq('sender_id', user.id)
            .eq('recipient_id', recipientId)
            .limit(1);

          if (checkError) {
            console.error('❌ Error checking existing like:', checkError);
            
            // Retry on network errors
            if (retryCount < 2 && (checkError.message.includes('network') || checkError.message.includes('timeout'))) {
              console.log(`🔄 Retrying like check (attempt ${retryCount + 1})`);
              setLoading(false);
              const result = await createLike(recipientId, isSuperLike, retryCount + 1);
              resolve(result);
              return;
            }
            
            toast.error('Failed to check existing like');
            setLoading(false);
            resolve(false);
            return;
          }

          if (existingLike && existingLike.length > 0) {
            console.log('ℹ️ Like already exists, skipping');
            toast.info('You already liked this profile');
            setLoading(false);
            resolve(false);
            return;
          }

          // Create the like with proper error handling
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
            
            // Handle specific error codes
            if (error.code === '23505') { // Unique constraint violation
              console.log('ℹ️ Duplicate like prevented by database constraint');
              toast.info('You already liked this profile');
              setLoading(false);
              resolve(false);
              return;
            } else if (error.code === '23503') { // Foreign key violation
              toast.error('User profile not found');
              setLoading(false);
              resolve(false);
              return;
            } else if (error.code === '42501') { // Insufficient privilege
              toast.error('Permission denied - please log in again');
              setLoading(false);
              resolve(false);
              return;
            } else if (retryCount < 2 && (error.message.includes('network') || error.message.includes('timeout'))) {
              // Retry on network errors
              console.log(`🔄 Retrying like creation (attempt ${retryCount + 1})`);
              setLoading(false);
              const result = await createLike(recipientId, isSuperLike, retryCount + 1);
              resolve(result);
              return;
            } else {
              toast.error(`Failed to send ${isSuperLike ? 'super like' : 'like'}: Please try again`);
              setLoading(false);
              resolve(false);
              return;
            }
          }

          console.log('✅ Like created successfully:', data);
          toast.success(`${isSuperLike ? 'Super like' : 'Like'} sent successfully!`);
          
          // Check for match after a short delay to allow trigger to process
          setTimeout(async () => {
            try {
              const isMatch = await checkMutualLike(recipientId);
              if (isMatch) {
                console.log('🎉 Match detected with:', recipientId);
                toast.success('🎉 It\'s a Match! You can now chat with this user.');
              }
            } catch (matchError) {
              console.error('❌ Error checking for match:', matchError);
              // Don't show error to user for match check failure
            }
          }, 500);
          
          setLoading(false);
          resolve(true);
        } catch (error) {
          console.error('❌ Unexpected error in createLike:', error);
          
          // Retry on network errors
          if (retryCount < 2) {
            console.log(`🔄 Retrying due to unexpected error (attempt ${retryCount + 1})`);
            setLoading(false);
            const result = await createLike(recipientId, isSuperLike, retryCount + 1);
            resolve(result);
            return;
          }
          
          toast.error('Network error - please try again');
          setLoading(false);
          resolve(false);
        }
      }, 300); // 300ms debounce
    });
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
      console.log('🔍 Checking for existing match between:', user.id, 'and', recipientId);
      
      // Check if a match exists between the two users
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${recipientId}),and(user1_id.eq.${recipientId},user2_id.eq.${user.id})`)
        .eq('is_active', true)
        .maybeSingle();

      if (matchError) {
        console.error('❌ Error checking for match:', matchError);
        return false;
      }

      const hasMatch = matchData !== null;
      console.log('🔍 Match check result:', { hasMatch, matchData });
      
      return hasMatch;
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
