
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EnhancedSwipeCard from './EnhancedSwipeCard';
import CardStackPreview from './CardStackPreview';
import SuperLikeButton from './SuperLikeButton';
import SwipeLimitModal from './SwipeLimitModal';
import PremiumFeatureGate from './PremiumFeatureGate';
import { Heart, X, RotateCcw, Filter, Users } from 'lucide-react';

interface DiscoveryUser {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar_url: string;
  interests: string[];
  location_city: string;
  location_state: string;
  user_type: 'creator' | 'consumer';
  verification_status: 'verified' | 'pending' | 'rejected';
  subscription_fee?: number;
  last_active?: string;
}

const EnhancedDiscoveryInterface = () => {
  const { profile } = useProfile();
  const { 
    canPerformAction, 
    incrementUsage, 
    getCurrentTier, 
    dailyUsage, 
    getTierLimits,
    upgradeTier 
  } = useUserSubscription();
  const { toast } = useToast();

  const [users, setUsers] = useState<DiscoveryUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showSwipeLimitModal, setShowSwipeLimitModal] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState('');
  const [requiredTier, setRequiredTier] = useState<'basic' | 'pro' | 'vip'>('basic');
  const [lastSwipedUser, setLastSwipedUser] = useState<DiscoveryUser | null>(null);

  useEffect(() => {
    fetchDiscoveryUsers();
  }, [profile]);

  const fetchDiscoveryUsers = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      // Fetch users based on preferences
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', profile.user_id)
        .eq('gender', profile.gender_preference === 'both' ? profile.gender_preference : profile.gender_preference)
        .gte('age', profile.age_range_min)
        .lte('age', profile.age_range_max);

      // Add location filter for free users
      if (getCurrentTier() === 'free') {
        query = query.eq('location_state', profile.location_state);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching discovery users:', error);
        return;
      }

      // Transform the data to match our interface
      const discoveryUsers: DiscoveryUser[] = (data || []).map(user => ({
        id: user.user_id,
        name: user.name,
        age: user.age,
        bio: user.bio || '',
        avatar_url: user.avatar_url || '/placeholder.svg',
        interests: user.interests || [],
        location_city: user.location_city,
        location_state: user.location_state,
        user_type: user.user_type as 'creator' | 'consumer',
        verification_status: user.verification_status as 'verified' | 'pending' | 'rejected',
        subscription_fee: user.subscription_fee,
        last_active: new Date().toISOString() // Mock last active for now
      }));

      setUsers(discoveryUsers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentUser = users[currentIndex];
    if (!currentUser) return;

    // Check swipe limits for free users
    if (getCurrentTier() === 'free' && !canPerformAction('swipes')) {
      setShowSwipeLimitModal(true);
      return;
    }

    // Increment usage
    await incrementUsage('swipes');

    // Record the swipe
    if (direction === 'right') {
      await recordLike(currentUser.id, false);
    }

    setLastSwipedUser(currentUser);
    setCurrentIndex(prev => prev + 1);

    // Show upgrade prompts for free users after certain actions
    if (getCurrentTier() === 'free' && dailyUsage.swipes_used >= 5) {
      setTimeout(() => {
        setPremiumFeature('Unlimited Swipes');
        setRequiredTier('basic');
        setShowPremiumGate(true);
      }, 1000);
    }
  };

  const handleSuperLike = async () => {
    const currentUser = users[currentIndex];
    if (!currentUser) return;

    await recordLike(currentUser.id, true);
    setLastSwipedUser(currentUser);
    setCurrentIndex(prev => prev + 1);
  };

  const handleRewind = async () => {
    if (getCurrentTier() === 'free') {
      setPremiumFeature('Rewind Last Swipe');
      setRequiredTier('basic');
      setShowPremiumGate(true);
      return;
    }

    if (!canPerformAction('rewinds')) {
      toast({
        title: "Daily Rewind Limit Reached",
        description: "You've used all your rewinds for today.",
        variant: "destructive"
      });
      return;
    }

    if (lastSwipedUser && currentIndex > 0) {
      await incrementUsage('rewinds');
      setCurrentIndex(prev => prev - 1);
      setLastSwipedUser(null);
      
      toast({
        title: "Rewind Successful",
        description: "Brought back your last swipe!",
      });
    }
  };

  const recordLike = async (recipientId: string, isSuperLike: boolean) => {
    try {
      const { error } = await supabase
        .from(isSuperLike ? 'super_likes' : 'likes')
        .insert({
          sender_id: profile?.user_id,
          recipient_id: recipientId,
          ...(isSuperLike ? {} : { is_super_like: false })
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error recording like:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpgrade = async (tier: 'basic' | 'pro' | 'vip') => {
    const costs = { basic: 10, pro: 20, vip: 40 };
    const result = await upgradeTier(tier, costs[tier]);
    
    if (result.success) {
      toast({
        title: "Upgrade Successful!",
        description: `Welcome to Hooks ${tier.charAt(0).toUpperCase() + tier.slice(1)}!`,
      });
      setShowPremiumGate(false);
      setShowSwipeLimitModal(false);
    } else {
      toast({
        title: "Upgrade Failed",
        description: result.error || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleSeeWhoLiked = () => {
    if (getCurrentTier() === 'free') {
      setPremiumFeature('See Who Liked You');
      setRequiredTier('basic');
      setShowPremiumGate(true);
      return;
    }
    
    // Navigate to likes page
    toast({
      title: "Feature Coming Soon",
      description: "See who liked you feature will be available soon!",
    });
  };

  const currentUser = users[currentIndex];
  const tierLimits = getTierLimits();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hooks-coral mx-auto mb-4"></div>
          <p>Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Users className="w-16 h-16 text-gray-400 mx-auto" />
          <h3 className="text-lg font-semibold">No More Profiles</h3>
          <p className="text-gray-600">Check back later for new matches!</p>
          <Button onClick={fetchDiscoveryUsers} variant="outline">
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Convert DiscoveryUser to the format expected by CardStackPreview and EnhancedSwipeCard
  const convertedUsers = users.map(user => ({
    id: parseInt(user.id),
    name: user.name,
    age: user.age,
    bio: user.bio,
    image: user.avatar_url,
    interests: user.interests,
    distance: `${Math.floor(Math.random() * 10) + 1} km away`,
    location_city: user.location_city,
    location_state: user.location_state,
    user_type: user.user_type,
    verification_status: user.verification_status,
    subscription_fee: user.subscription_fee,
    last_active: user.last_active,
    follower_count: Math.floor(Math.random() * 5000) + 100,
    subscriber_count: user.user_type === 'creator' ? Math.floor(Math.random() * 1000) + 50 : undefined
  }));

  const currentConvertedUser = convertedUsers[currentIndex];

  return (
    <div className="max-w-sm mx-auto space-y-6">
      {/* Usage Stats for Premium Users */}
      {getCurrentTier() !== 'free' && (
        <div className="bg-gradient-to-r from-hooks-coral to-hooks-pink text-white p-3 rounded-lg text-sm">
          <div className="flex justify-between items-center">
            <span>Hooks {getCurrentTier().charAt(0).toUpperCase() + getCurrentTier().slice(1)}</span>
            <span>Swipes: {dailyUsage.swipes_used} today</span>
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="relative h-[600px]">
        <CardStackPreview users={convertedUsers} currentIndex={currentIndex} />
        
        <EnhancedSwipeCard
          user={currentConvertedUser}
          onSwipe={handleSwipe}
          onSuperLike={handleSuperLike}
          onViewProfile={() => {
            toast({
              title: "Profile View",
              description: "Full profile view coming soon!",
            });
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4">
        {/* Rewind Button */}
        <Button
          onClick={handleRewind}
          disabled={currentIndex === 0}
          variant="outline"
          className="w-12 h-12 rounded-full border-gray-300"
        >
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </Button>

        {/* Pass Button */}
        <Button
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <X className="w-6 h-6 text-gray-600" />
        </Button>

        {/* Super Like Button */}
        <SuperLikeButton
          onSuperLike={handleSuperLike}
          onUpgradeRequired={() => {
            setPremiumFeature('Super Likes');
            setRequiredTier('basic');
            setShowPremiumGate(true);
          }}
        />

        {/* Like Button */}
        <Button
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600"
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>

        {/* See Likes Button */}
        <Button
          onClick={handleSeeWhoLiked}
          variant="outline"
          className="w-12 h-12 rounded-full border-hooks-coral text-hooks-coral hover:bg-hooks-coral hover:text-white"
        >
          <Users className="w-5 h-5" />
        </Button>
      </div>

      {/* Free Tier Limits Display */}
      {getCurrentTier() === 'free' && (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">
            Daily Swipes: {dailyUsage.swipes_used}/{tierLimits.daily_swipes}
          </p>
          <Button
            onClick={() => {
              setPremiumFeature('Unlimited Features');
              setRequiredTier('basic');
              setShowPremiumGate(true);
            }}
            className="bg-hooks-coral hover:bg-hooks-coral/90 text-sm"
          >
            Upgrade to Hooks Basic
          </Button>
        </div>
      )}

      {/* Modals */}
      <SwipeLimitModal
        isOpen={showSwipeLimitModal}
        onClose={() => setShowSwipeLimitModal(false)}
        onUpgrade={() => {
          setShowSwipeLimitModal(false);
          setPremiumFeature('Unlimited Swipes');
          setRequiredTier('basic');
          setShowPremiumGate(true);
        }}
        swipesUsed={dailyUsage.swipes_used}
        swipesLimit={tierLimits.daily_swipes}
        resetTime="midnight"
      />

      <PremiumFeatureGate
        isOpen={showPremiumGate}
        onClose={() => setShowPremiumGate(false)}
        onUpgrade={handleUpgrade}
        feature={premiumFeature}
        currentTier={getCurrentTier()}
        requiredTier={requiredTier}
      />
    </div>
  );
};

export default EnhancedDiscoveryInterface;
