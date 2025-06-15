
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

      // Get matches for this user (returns "other" user's details for each match)
      const { data, error: rpcError } = await supabase.rpc('get_user_matches', {
        user_uuid: user.id
      });

      if (rpcError) {
        console.error('[useMatches] RPC error fetching matches:', rpcError);
        setError('Failed to load matches');
        setMatches([]);
        return;
      }

      // Data must be an array if not error
      if (!Array.isArray(data)) {
        console.error('[useMatches] RPC returned invalid data (not array):', data);
        setError('Failed to load matches');
        setMatches([]);
        return;
      }

      // Each row = match with other user's details, as defined by function
      const transformedMatches: Match[] = data.map((row: any) => ({
        id: row.match_id,
        user_id: row.other_user_id,
        name: row.other_name || 'Unknown User',
        age: row.other_age || 18,
        bio: row.other_bio || '',
        image: row.other_avatar_url ||
          'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop',
        interests: row.other_interests || [],
        distance: '2 km away', // Placeholder; real geodata can be added later
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
      }));

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

  // Initial fetch when user is set
  useEffect(() => {
    if (user !== undefined) fetchMatches();
  }, [user, fetchMatches]);

  // Real-time updates for new matches
  useEffect(() => {
    if (!user) return;
    let debounceTimer: NodeJS.Timeout;
    const channel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        (payload) => {
          const newMatch = payload.new as any;
          if (newMatch.user1_id === user.id || newMatch.user2_id === user.id) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              fetchMatches();
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [user, fetchMatches]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
    retryCount
  };
};
