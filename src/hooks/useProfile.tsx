
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio?: string;
  user_type: 'creator' | 'consumer';
  location_state: string;
  location_city: string;
  gender: 'male' | 'female' | 'non-binary';
  gender_preference: 'male' | 'female' | 'both';
  age_range_min: number;
  age_range_max: number;
  search_radius_km: number;
  interests: string[];
  avatar_url?: string;
  subscription_fee?: number;
  services_offered?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_age_verified: boolean;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        // Type cast the data to ensure compatibility
        const profileData: Profile = {
          ...data,
          user_type: data.user_type as 'creator' | 'consumer',
          gender: data.gender as 'male' | 'female' | 'non-binary',
          gender_preference: data.gender_preference as 'male' | 'female' | 'both',
          verification_status: data.verification_status as 'pending' | 'verified' | 'rejected'
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<Profile, 'id' | 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user!.id,
          ...profileData
        })
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the response
      const newProfile: Profile = {
        ...data,
        user_type: data.user_type as 'creator' | 'consumer',
        gender: data.gender as 'male' | 'female' | 'non-binary',
        gender_preference: data.gender_preference as 'male' | 'female' | 'both',
        verification_status: data.verification_status as 'pending' | 'verified' | 'rejected'
      };
      
      setProfile(newProfile);
      return { data: newProfile, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user!.id)
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the response
      const updatedProfile: Profile = {
        ...data,
        user_type: data.user_type as 'creator' | 'consumer',
        gender: data.gender as 'male' | 'female' | 'non-binary',
        gender_preference: data.gender_preference as 'male' | 'female' | 'both',
        verification_status: data.verification_status as 'pending' | 'verified' | 'rejected'
      };
      
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refetch: fetchProfile
  };
};
