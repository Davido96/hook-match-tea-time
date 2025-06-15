
import { useState, useEffect } from 'react';
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

  const fetchMatches = async () => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching matches for user:', user.id);
      setLoading(true);
      setError(null);

      // Fetch matches where the current user is either user1 or user2
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          is_active
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true);

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        setError('Failed to load matches');
        return;
      }

      console.log('Raw matches data:', matchesData);

      if (!matchesData || matchesData.length === 0) {
        console.log('No matches found');
        setMatches([]);
        return;
      }

      // Extract the other user's ID from each match
      const otherUserIds = matchesData.map(match => 
        match.user1_id === user.id ? match.user2_id : match.user1_id
      );

      console.log('Other user IDs:', otherUserIds);

      // Fetch profiles for the matched users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', otherUserIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError('Failed to load match profiles');
        return;
      }

      console.log('Matched profiles:', profilesData);

      // Transform profiles to match interface
      const transformedMatches: Match[] = (profilesData || []).map(profile => ({
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name || 'Unknown User',
        age: profile.age || 18,
        bio: profile.bio || 'No bio available',
        image: profile.avatar_url || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop',
        interests: profile.interests || [],
        distance: '2 km away', // Default distance - could be calculated based on location
        location: profile.location_city && profile.location_state 
          ? `${profile.location_city}, ${profile.location_state}` 
          : 'Location not specified',
        gender: profile.gender,
        user_type: profile.user_type as 'creator' | 'consumer',
        verification_status: profile.verification_status as 'verified' | 'pending' | 'rejected',
        last_active: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }));

      console.log('Transformed matches:', transformedMatches);
      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error in fetchMatches:', error);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  // Subscribe to real-time match updates
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time match subscription for user:', user.id);

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
            console.log('Match involves current user, refetching matches');
            fetchMatches();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up match subscription');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches
  };
};
