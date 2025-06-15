
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  interests: string[];
  distance: string;
  location?: string;
  gender?: string;
  user_type?: 'creator' | 'consumer';
  verification_status?: 'verified' | 'pending' | 'rejected';
  last_active?: string;
  conversation_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMatches = useCallback(async () => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching matches for user:', user.id);

      const { data, error: rpcError } = await supabase.rpc(
        'get_user_matches' as any,
        { user_uuid: user.id }
      );

      if (rpcError) {
        console.error('[useMatches] RPC error fetching matches:', rpcError);
        setError('Failed to load matches');
        setMatches([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error('[useMatches] RPC returned invalid data (not array):', data);
        setError('Failed to load matches');
        setMatches([]);
        return;
      }

      const transformedMatches: Match[] = data.map((row: any) => ({
        id: row.match_id,
        user_id: row.other_user_id,
        name: row.other_name || 'Unknown User',
        age: row.other_age || 18,
        bio: row.other_bio || '',
        image: row.other_avatar_url ||
          'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop',
        interests: row.other_interests || [],
        distance: '2 km away', // Placeholder
        location:
          row.other_location_city && row.other_location_state
            ? `${row.other_location_city}, ${row.other_location_state}`
            : 'Location not specified',
        gender: row.other_gender,
        user_type: row.other_user_type as 'creator' | 'consumer',
        verification_status: (row.other_verification_status ??
          'pending') as 'verified' | 'pending' | 'rejected',
        last_active: row.other_last_active
          ? new Date(row.other_last_active).toISOString()
          : undefined,
        conversation_id: row.conversation_id,
        last_message: row.last_message_content,
        last_message_at: row.last_message_at,
        unread_count: row.unread_count || 0
      }));

      console.log('[useMatches] Successfully fetched matches:', transformedMatches.length);
      setMatches(transformedMatches);
      setRetryCount(0);
    } catch (error: any) {
      console.error('[useMatches] Error:', error);
      setError('Failed to load matches');
      setMatches([]);
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchMatches();
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [user, retryCount]);

  useEffect(() => {
    if (user !== undefined) fetchMatches();
  }, [user, fetchMatches]);

  // Real-time updates for new matches and conversations
  useEffect(() => {
    if (!user) return;
    
    let debounceTimer: NodeJS.Timeout;
    
    const channel = supabase
      .channel('matches-conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          const match = payload.new as any;
          if (match && (match.user1_id === user.id || match.user2_id === user.id)) {
            console.log('[useMatches] Match change detected, refreshing');
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              fetchMatches();
            }, 1000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          console.log('[useMatches] Conversation change detected, refreshing');
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchMatches();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user, fetchMatches]);

  // Listen for custom match events
  useEffect(() => {
    const handleNewMatch = () => {
      console.log('[useMatches] Custom newMatch event received, refreshing matches');
      fetchMatches();
    };

    window.addEventListener('newMatch', handleNewMatch);
    return () => window.removeEventListener('newMatch', handleNewMatch);
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
    retryCount
  };
};
