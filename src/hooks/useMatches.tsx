
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
      console.log('No user found, clearing matches');
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching matches for user:', user.id);
      setLoading(true);
      setError(null);

      // Create a timeout promise (10 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      // Optimized single query using JOIN to get matches and profiles together
      const matchesPromise = supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          is_active,
          profiles!inner(
            id,
            user_id,
            name,
            age,
            bio,
            avatar_url,
            interests,
            location_city,
            location_state,
            gender,
            user_type,
            verification_status
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true);

      // Race between the query and timeout
      const matchesData = await Promise.race([matchesPromise, timeoutPromise]) as any;

      if (matchesData.error) {
        console.error('Error fetching matches:', matchesData.error);
        setError('Failed to load matches');
        return;
      }

      console.log('Raw matches data:', matchesData.data);

      if (!matchesData.data || matchesData.data.length === 0) {
        console.log('No matches found');
        setMatches([]);
        setRetryCount(0);
        return;
      }

      // Transform the joined data to match interface
      const transformedMatches: Match[] = matchesData.data.map((match: any) => {
        // Get the other user's profile (not the current user)
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const profile = match.profiles;

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name || 'Unknown User',
          age: profile.age || 18,
          bio: profile.bio || 'No bio available',
          image: profile.avatar_url || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop',
          interests: profile.interests || [],
          distance: '2 km away',
          location: profile.location_city && profile.location_state 
            ? `${profile.location_city}, ${profile.location_state}` 
            : 'Location not specified',
          gender: profile.gender,
          user_type: profile.user_type as 'creator' | 'consumer',
          verification_status: profile.verification_status as 'verified' | 'pending' | 'rejected',
          last_active: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
        };
      });

      console.log('Transformed matches:', transformedMatches);
      setMatches(transformedMatches);
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error in fetchMatches:', error);
      
      if (error.message === 'Request timeout') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load matches');
      }

      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchMatches();
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  }, [user, retryCount]);

  // Initial fetch with dependency on user being ready
  useEffect(() => {
    if (user !== undefined) { // Only run when auth state is determined
      fetchMatches();
    }
  }, [user, fetchMatches]);

  // Optimized real-time subscription with debouncing
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time match subscription for user:', user.id);

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
          console.log('New match detected:', payload);
          const newMatch = payload.new as any;
          
          // Check if this match involves the current user
          if (newMatch.user1_id === user.id || newMatch.user2_id === user.id) {
            console.log('Match involves current user, debouncing refetch');
            
            // Debounce the refetch to prevent excessive calls
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              fetchMatches();
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up match subscription');
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
