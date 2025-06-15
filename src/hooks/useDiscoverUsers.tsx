
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DiscoverUser {
  id: number;
  user_id: string; // Preserve original database user_id for navigation
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
  subscriber_count?: number;
  last_active?: string;
  subscriptionFee?: number;
  follower_count?: number;
}

export const useDiscoverUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching real users for discover interface');
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id) // Exclude current user
        .limit(50);

      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        setError('Failed to load users');
        return;
      }

      console.log('Fetched profiles:', data?.length || 0, 'users');

      // Transform database users to discover user format
      const transformedUsers: DiscoverUser[] = (data || []).map((profile, index) => ({
        id: parseInt(profile.id?.substring(0, 8) || index.toString(), 16) || index, // Keep numeric ID for UI purposes
        user_id: profile.user_id, // Preserve original UUID for navigation
        name: profile.name || 'Unknown User',
        age: profile.age || 18,
        bio: profile.bio || 'No bio available',
        image: profile.avatar_url || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop',
        interests: profile.interests || [],
        distance: '2 km away', // Default distance - could be calculated based on location
        location: `${profile.location_city}, ${profile.location_state}`,
        gender: profile.gender,
        user_type: profile.user_type as 'creator' | 'consumer',
        verification_status: profile.verification_status as 'verified' | 'pending' | 'rejected',
        subscriptionFee: profile.subscription_fee || 0,
        subscriber_count: Math.floor(Math.random() * 1000), // Placeholder
        follower_count: Math.floor(Math.random() * 500), // Placeholder
        last_active: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }));

      console.log('Transformed users with preserved user_ids:', transformedUsers.map(u => ({ name: u.name, user_id: u.user_id })));
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers
  };
};
