
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralCode {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  referral_earnings: number;
}

interface ReferralRecord {
  id: string;
  referral_code: string;
  status: string;
  reward_amount: number;
  referee_reward_amount: number;
  created_at: string;
  completed_at: string | null;
  referee_profile?: {
    name: string;
    user_type: string;
  } | null;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile) {
      fetchReferralData();
    }
  }, [user, profile]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      // Get or create referral code
      const { data: codeResult, error: codeError } = await supabase
        .rpc('ensure_referral_code', {
          user_uuid: user!.id,
          user_name: profile!.name
        });

      if (codeError) {
        console.error('Error getting referral code:', codeError);
      } else {
        // Fetch the full referral code record
        const { data: codeData } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('user_id', user!.id)
          .eq('code', codeResult)
          .single();
        
        if (codeData) {
          setReferralCode(codeData);
        }
      }

      // Get referral stats from profile
      setReferralStats({
        total_referrals: profile!.total_referrals || 0,
        successful_referrals: profile!.successful_referrals || 0,
        referral_earnings: profile!.referral_earnings || 0
      });

      // Get referral history
      const { data: historyData } = await supabase
        .from('referrals')
        .select(`
          *,
          referee_profile:profiles!referrals_referee_id_fkey(name, user_type)
        `)
        .eq('referrer_id', user!.id)
        .order('created_at', { ascending: false });

      if (historyData) {
        const processedHistory = historyData.map(item => ({
          id: item.id,
          referral_code: item.referral_code,
          status: item.status,
          reward_amount: item.reward_amount || 0,
          referee_reward_amount: item.referee_reward_amount || 0,
          created_at: item.created_at,
          completed_at: item.completed_at,
          referee_profile: item.referee_profile || null
        }));
        setReferralHistory(processedHistory);
      }

    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = (code: string) => {
    return `${window.location.origin}/auth/signup?ref=${code}`;
  };

  const shareReferral = async (platform: 'whatsapp' | 'twitter' | 'copy' = 'copy') => {
    if (!referralCode) return;

    const link = generateReferralLink(referralCode.code);
    const message = `Join me on Hook! Use my referral code ${referralCode.code} and we both get bonus Keys! ${link}`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(link);
        toast({
          title: "Referral link copied!",
          description: "Share it with friends to earn Keys together.",
        });
        break;
    }
  };

  const getRewardAmount = (referrerType: string, refereeType: string) => {
    if (referrerType === 'creator') {
      return refereeType === 'creator' ? 150 : 75;
    } else {
      return refereeType === 'creator' ? 100 : 50;
    }
  };

  return {
    referralCode,
    referralStats,
    referralHistory,
    loading,
    shareReferral,
    generateReferralLink,
    getRewardAmount,
    refetch: fetchReferralData
  };
};
