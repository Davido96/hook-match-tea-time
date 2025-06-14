
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
    if (!user) return;
    
    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (data) {
        console.log('Profile found:', data);
        const profileData: Profile = {
          ...data,
          user_type: data.user_type as 'creator' | 'consumer',
          gender: data.gender as 'male' | 'female' | 'non-binary',
          gender_preference: data.gender_preference as 'male' | 'female' | 'both',
          verification_status: data.verification_status as 'pending' | 'verified' | 'rejected'
        };
        setProfile(profileData);
      } else {
        console.log('No profile found for user');
        setProfile(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profileData: Omit<Profile, 'id' | 'user_id'>) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      console.log('Creating profile for user:', user.id, profileData);
      
      // Ensure required fields have default values
      const dataToInsert = {
        user_id: user.id,
        name: profileData.name || '',
        age: profileData.age || 18,
        bio: profileData.bio || '',
        user_type: profileData.user_type,
        location_state: profileData.location_state || '',
        location_city: profileData.location_city || '',
        gender: profileData.gender,
        gender_preference: profileData.gender_preference,
        age_range_min: profileData.age_range_min || 18,
        age_range_max: profileData.age_range_max || 35,
        search_radius_km: profileData.search_radius_km || 50,
        interests: profileData.interests || [],
        avatar_url: profileData.avatar_url || null,
        subscription_fee: profileData.subscription_fee || 0,
        services_offered: profileData.services_offered || '',
        verification_status: 'pending',
        is_age_verified: profileData.is_age_verified || false
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return { data: null, error };
      }
      
      console.log('Profile created successfully:', data);
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
      console.error('Profile creation failed:', error);
      return { data: null, error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
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

  const uploadAvatar = async (file: File) => {
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      console.log('Starting avatar upload for user:', user.id);
      
      // Create a unique filename with user ID prefix for RLS
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading file to path:', fileName);

      // Upload the file to the avatars bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { data: null, error: uploadError };
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('Public URL:', urlData.publicUrl);

      return { data: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Avatar upload failed:', error);
      return { data: null, error };
    }
  };

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile
  };
};
