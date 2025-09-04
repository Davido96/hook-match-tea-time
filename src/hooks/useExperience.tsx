import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserExperience {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  discovery_level: number;
  match_level: number;
  social_level: number;
  created_at: string;
  updated_at: string;
}

export const useExperience = () => {
  const { user } = useAuth();
  const [experience, setExperience] = useState<UserExperience | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchExperience = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_experience')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching experience:', error);
        return;
      }

      if (data) {
        setExperience(data);
      } else {
        // Create initial experience record if it doesn't exist
        const { data: newExp, error: createError } = await supabase
          .from('user_experience')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            xp_to_next_level: 100,
            discovery_level: 1,
            match_level: 1,
            social_level: 1
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating experience record:', createError);
        } else {
          setExperience(newExp);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExperience = async (xpAmount: number) => {
    if (!user) return;

    try {
      await supabase.rpc('add_user_experience', {
        user_uuid: user.id,
        xp_amount: xpAmount
      });

      // Refresh experience data
      await fetchExperience();
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  };

  const getLevelProgress = () => {
    if (!experience) return 0;
    
    const xpForCurrentLevel = experience.current_level * 100;
    const xpForNextLevel = (experience.current_level + 1) * 100;
    const currentXpInLevel = experience.total_xp - ((experience.current_level - 1) * 100);
    
    return (currentXpInLevel / 100) * 100;
  };

  const getXpForLevel = (level: number) => {
    return level * 100;
  };

  const getTotalXpForLevel = (level: number) => {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += getXpForLevel(i);
    }
    return total;
  };

  const getLevelFromXp = (totalXp: number) => {
    let level = 1;
    let xpUsed = 0;
    
    while (xpUsed + getXpForLevel(level) <= totalXp) {
      xpUsed += getXpForLevel(level);
      level++;
    }
    
    return level;
  };

  const getRankTitle = (level: number) => {
    if (level <= 5) return 'Newcomer';
    if (level <= 10) return 'Explorer';
    if (level <= 20) return 'Adventurer';
    if (level <= 35) return 'Expert';
    if (level <= 50) return 'Master';
    if (level <= 75) return 'Legend';
    return 'Mythical';
  };

  useEffect(() => {
    if (user) {
      fetchExperience();
    }
  }, [user]);

  return {
    experience,
    loading,
    addExperience,
    getLevelProgress,
    getXpForLevel,
    getTotalXpForLevel,
    getLevelFromXp,
    getRankTitle,
    refetch: fetchExperience
  };
};