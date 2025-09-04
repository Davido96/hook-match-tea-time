import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAchievements } from './useAchievements';
import { useExperience } from './useExperience';
import { useChallenges } from './useChallenges';

export const useGamifiedActions = () => {
  const { user } = useAuth();
  const { checkAchievements } = useAchievements();
  const { refetch: refetchExperience } = useExperience();
  const { refetch: refetchChallenges } = useChallenges();

  const handleAction = async (actionType: string, amount: number = 1) => {
    if (!user) return;

    try {
      // Use the gamified function that handles XP, achievements, and challenges
      const { error } = await supabase.rpc('handle_user_action', {
        user_uuid: user.id,
        action_type: actionType,
        increment_amount: amount
      });

      if (error) {
        console.error(`Error handling ${actionType} action:`, error);
        return;
      }

      // Refresh gamification data
      await Promise.all([
        checkAchievements(),
        refetchExperience(),
        refetchChallenges()
      ]);
    } catch (error) {
      console.error(`Error in gamified ${actionType} action:`, error);
    }
  };

  const handleSwipe = () => handleAction('swipes', 1);
  const handleSuperLike = () => handleAction('super_likes', 1);
  const handleMatch = () => handleAction('matches', 1);
  const handleMessage = () => handleAction('messages', 1);
  const handleFollow = () => handleAction('follows', 1);
  
  return {
    handleSwipe,
    handleSuperLike,
    handleMatch,
    handleMessage,
    handleFollow,
    handleAction
  };
};