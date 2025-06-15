
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface IncomingLike {
  like_id: string;
  sender_id: string;
  sender_name: string;
  sender_age: number;
  sender_bio?: string;
  sender_avatar_url?: string;
  sender_interests: string[];
  sender_location_city: string;
  sender_location_state: string;
  sender_user_type: 'creator' | 'consumer';
  sender_verification_status: string;
  is_super_like: boolean;
  created_at: string;
}

export const useIncomingLikes = () => {
  const { user } = useAuth();
  const [incomingLikes, setIncomingLikes] = useState<IncomingLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchIncomingLikes = useCallback(async () => {
    if (!user) {
      setIncomingLikes([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching incoming likes for user:', user.id);
      
      const { data, error } = await supabase.rpc('get_incoming_likes', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error fetching incoming likes:', error);
        toast.error('Failed to load incoming likes');
        return;
      }

      console.log('Incoming likes data:', data);
      
      // Type assertion to ensure proper typing
      const typedData = data?.map((like: any) => ({
        ...like,
        sender_user_type: like.sender_user_type as 'creator' | 'consumer'
      })) as IncomingLike[] || [];
      
      setIncomingLikes(typedData);
    } catch (error) {
      console.error('Error in fetchIncomingLikes:', error);
      toast.error('Failed to load incoming likes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const respondToLike = async (likeId: string, response: 'accepted' | 'rejected') => {
    if (!user || processing === likeId) return false;

    console.log(`Responding to like ${likeId} with: ${response}`);
    setProcessing(likeId);

    try {
      const { data, error } = await supabase.rpc('respond_to_like', {
        like_id_param: likeId,
        response_status: response
      });

      if (error) {
        console.error('Error responding to like:', error);
        toast.error(`Failed to ${response} like: ${error.message}`);
        return false;
      }

      console.log('Like response successful:', data);
      
      // Remove the like from local state immediately
      setIncomingLikes(prev => prev.filter(like => like.like_id !== likeId));
      
      if (response === 'accepted') {
        toast.success('Like accepted! 💕 You have a new match! Check your messages.', {
          duration: 4000,
        });
        
        // Trigger a refresh of matches after a short delay to allow database triggers to complete
        setTimeout(() => {
          // This will be picked up by real-time subscriptions in matches hook
          console.log('Match should be created and available now');
        }, 1000);
      } else {
        toast.success('Like declined', {
          duration: 2000,
        });
      }

      return true;
    } catch (error) {
      console.error('Error in respondToLike:', error);
      toast.error(`Failed to ${response} like. Please try again.`);
      return false;
    } finally {
      // Clear processing state after a short delay to prevent rapid clicking
      setTimeout(() => {
        setProcessing(null);
      }, 500);
    }
  };

  const acceptLike = (likeId: string) => respondToLike(likeId, 'accepted');
  const rejectLike = (likeId: string) => respondToLike(likeId, 'rejected');

  // Initial fetch
  useEffect(() => {
    if (user !== undefined) {
      fetchIncomingLikes();
    }
  }, [user, fetchIncomingLikes]);

  // Real-time subscription for new likes
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for incoming likes');

    const channel = supabase
      .channel('incoming-likes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New like received:', payload);
          // Refresh the list to get the complete profile data
          fetchIncomingLikes();
          
          toast.success('Someone liked you! 💕', {
            description: 'Check your incoming likes to respond',
            duration: 4000,
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up incoming likes subscription');
      supabase.removeChannel(channel);
    };
  }, [user, fetchIncomingLikes]);

  return {
    incomingLikes,
    loading,
    processing,
    acceptLike,
    rejectLike,
    refetch: fetchIncomingLikes,
    count: incomingLikes.length
  };
};
