import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useFollows = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [followCounts, setFollowCounts] = useState<{[key: string]: { followers: number, following: number }}>({});

  const followUser = async (followingId: string) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('You must be logged in to follow users');
    }

    if (user.id === followingId) {
      console.error('Cannot follow yourself');
      throw new Error('You cannot follow yourself');
    }
    
    setLoading(true);
    try {
      console.log('Attempting to follow user:', followingId);

      // First check if already following to prevent duplicates
      const { data: existingFollow, error: checkError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', followingId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing follow:', checkError);
        throw new Error('Failed to check follow status');
      }

      if (existingFollow) {
        console.log('Already following this user');
        throw new Error('You are already following this user');
      }

      // Create the follow relationship
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: followingId
        });

      if (error) {
        console.error('Error following user:', error);
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You are already following this user');
        }
        throw new Error(`Failed to follow user: ${error.message}`);
      }

      console.log('Successfully followed user');
      // Update follow counts
      await getFollowCounts(followingId);
    } catch (error) {
      console.error('Error in followUser:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (followingId: string) => {
    if (!user) {
      console.error('User not authenticated');
      throw new Error('You must be logged in to unfollow users');
    }
    
    setLoading(true);
    try {
      console.log('Attempting to unfollow user:', followingId);

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId);

      if (error) {
        console.error('Error unfollowing user:', error);
        throw new Error(`Failed to unfollow user: ${error.message}`);
      }

      console.log('Successfully unfollowed user');
      // Update follow counts
      await getFollowCounts(followingId);
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isFollowing = async (followingId: string): Promise<boolean> => {
    if (!user) {
      console.log('User not authenticated, cannot check follow status');
      return false;
    }
    
    try {
      console.log('Checking if following user:', followingId);
      
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
      
      const isFollowingResult = !!data;
      console.log('Follow status result:', isFollowingResult);
      return isFollowingResult;
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
