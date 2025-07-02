
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
  withdrawal_pin_hash?: string | null;
  referred_by?: string | null;
  total_referrals?: number;
  successful_referrals?: number;
  referral_earnings?: number;
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
          verification_status: data.verification_status as 'pending' | 'verified' | 'rejected',
          withdrawal_pin_hash: data.withdrawal_pin_hash
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
        is_age_verified: profileData.is_age_verified || false,
        withdrawal_pin_hash: null
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
        verification_status: data.verification_status as 'pending' | 'verified' | 'rejected',
        withdrawal_pin_hash: data.withdrawal_pin_hash
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

    if (!profile) {
      console.error('No profile found to update');
      return { data: null, error: new Error('No profile found to update') };
    }

    try {
      console.log('Updating profile with:', updates);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        throw error;
      }
      
      const updatedProfile: Profile = {
        ...data,
        user_type: data.user_type as 'creator' | 'consumer',
        gender: data.gender as 'male' | 'female' | 'non-binary',
        gender_preference: data.gender_preference as 'male' | 'female' | 'both',
        verification_status: data.verification_status as 'pending' | 'verified' | 'rejected',
        withdrawal_pin_hash: data.withdrawal_pin_hash
      };
      
      setProfile(updatedProfile);
      return { data: updatedProfile, error: null };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { data: null, error };
    }
  };

  const uploadAvatarDuringSetup = async (file: File) => {
    if (!user) {
      console.error('Avatar upload: User not authenticated');
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      console.log('Starting avatar upload during setup for user:', user.id);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { data: null, error: new Error('File must be an image') };
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return { data: null, error: new Error('File size must be less than 5MB') };
      }

      // Create a unique filename with proper folder structure for RLS
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file to path:', filePath);

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
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
        .getPublicUrl(filePath);

      console.log('Public URL generated:', urlData.publicUrl);

      return { data: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Avatar upload during setup failed:', error);
      return { data: null, error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      console.error('Avatar upload: User not authenticated');
      return { data: null, error: new Error('User not authenticated') };
    }

    if (!profile) {
      console.error('Avatar upload: No profile found');
      return { data: null, error: new Error('Profile must be created before uploading avatar') };
    }

    try {
      console.log('Starting avatar upload for user:', user.id);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return { data: null, error: new Error('File must be an image') };
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return { data: null, error: new Error('File size must be less than 5MB') };
      }

      // Create a unique filename with proper folder structure for RLS
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading file to path:', filePath);

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          const { error: deleteError } = await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
          
          if (deleteError) {
            console.warn('Could not delete old avatar:', deleteError);
          }
        }
      }

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
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
        .getPublicUrl(filePath);

      console.log('Public URL generated:', urlData.publicUrl);

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
    uploadAvatarDuringSetup,
    refetch: fetchProfile
  };
};
