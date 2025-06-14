
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useFollows = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [followCounts, setFollowCounts] = useState<{[key: string]: { followers: number, following: number }}>({});

  const followUser = async (followingId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: followingId
        });

      if (error) {
        console.error('Error following user:', error);
        throw error;
      } else {
        console.log('Successfully followed user');
        // Update follow counts
        await getFollowCounts(followingId);
      }
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (followingId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) {
        console.error('Error unfollowing user:', error);
        throw error;
      } else {
        console.log('Successfully unfollowed user');
        // Update follow counts
        await getFollowCounts(followingId);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = async (followingId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .maybeSingle();

      if (error) {
        console.error('Error checking follow status:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };

  const getFollowCounts = async (userId: string) => {
    try {
      // Get followers count
      const { count: followersCount, error: followersError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followersError || followingError) {
        console.error('Error fetching follow counts:', followersError || followingError);
        return { followers: 0, following: 0 };
      }

      const counts = {
        followers: followersCount || 0,
        following: followingCount || 0
      };

      setFollowCounts(prev => ({
        ...prev,
        [userId]: counts
      }));

      return counts;
    } catch (error) {
      console.error('Error fetching follow counts:', error);
      return { followers: 0, following: 0 };
    }
  };

  const getFollowers = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (
            name,
            avatar_url,
            user_type
          )
        `)
        .eq('following_id', userId);

      if (error) {
        console.error('Error fetching followers:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  };

  const getFollowing = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            name,
            avatar_url,
            user_type
          )
        `)
        .eq('follower_id', userId);

      if (error) {
        console.error('Error fetching following:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  };

  return {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
    getFollowCounts,
    followCounts,
    loading
  };
};
