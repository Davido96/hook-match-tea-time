import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: 'daily' | 'weekly' | 'monthly' | 'event';
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  keys_reward: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  challenge: Challenge;
}

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      // Fetch active challenges
      const { data: activeChallenges, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

      if (challengesError) {
        console.error('Error fetching challenges:', challengesError);
        return;
      }

      // Fetch user's challenge progress
      const { data: userProgress, error: progressError } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error fetching user challenges:', progressError);
        return;
      }

      setChallenges((activeChallenges || []) as Challenge[]);
      setUserChallenges((userProgress || []) as UserChallenge[]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChallengeProgress = (challengeId: string) => {
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);
    return userChallenge ? userChallenge.progress : 0;
  };

  const isChallengeCompleted = (challengeId: string) => {
    const userChallenge = userChallenges.find(uc => uc.challenge_id === challengeId);
    return userChallenge ? userChallenge.is_completed : false;
  };

  const getCompletedChallenges = () => {
    return userChallenges.filter(uc => uc.is_completed);
  };

  const getChallengesByType = (type: string) => {
    return challenges.filter(c => c.challenge_type === type);
  };

  const getActiveChallenges = () => {
    const now = new Date();
    return challenges.filter(c => {
      const expiresAt = new Date(c.expires_at);
      return expiresAt > now && !isChallengeCompleted(c.id);
    });
  };

  const getDaysUntilExpiry = (challenge: Challenge) => {
    const now = new Date();
    const expiresAt = new Date(challenge.expires_at);
    const diffTime = Math.abs(expiresAt.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getHoursUntilExpiry = (challenge: Challenge) => {
    const now = new Date();
    const expiresAt = new Date(challenge.expires_at);
    const diffTime = Math.abs(expiresAt.getTime() - now.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    if (!user) return;

    try {
      await supabase
        .from('user_challenges')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: progress,
          is_completed: false
        });

      // Refresh challenges after updating
      await fetchChallenges();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  return {
    challenges,
    userChallenges,
    loading,
    getChallengeProgress,
    isChallengeCompleted,
    getCompletedChallenges,
    getChallengesByType,
    getActiveChallenges,
    getDaysUntilExpiry,
    getHoursUntilExpiry,
    updateChallengeProgress,
    refetch: fetchChallenges
  };
};