import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  keys_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_active: boolean;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_completed: boolean;
  earned_at: string;
  achievement: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Fetch all available achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: true });

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        return;
      }

      // Fetch user's achievement progress
      const { data: userProgress, error: progressError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error fetching user achievements:', progressError);
        return;
      }

      setAchievements((allAchievements || []) as Achievement[]);
      setUserAchievements((userProgress || []) as UserAchievement[]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementProgress = (achievementId: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return userAchievement ? userAchievement.progress : 0;
  };

  const isAchievementCompleted = (achievementId: string) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return userAchievement ? userAchievement.is_completed : false;
  };

  const getCompletedAchievements = () => {
    return userAchievements.filter(ua => ua.is_completed);
  };

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(a => a.category === category);
  };

  const checkAchievements = async () => {
    if (!user) return;

    try {
      await supabase.rpc('check_and_award_achievements', {
        user_uuid: user.id
      });
      // Refresh achievements after checking
      await fetchAchievements();
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  return {
    achievements,
    userAchievements,
    loading,
    getAchievementProgress,
    isAchievementCompleted,
    getCompletedAchievements,
    getAchievementsByCategory,
    checkAchievements,
    refetch: fetchAchievements
  };
};