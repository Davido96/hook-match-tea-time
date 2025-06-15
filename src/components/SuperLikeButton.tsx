
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useToast } from '@/hooks/use-toast';

interface SuperLikeButtonProps {
  onSuperLike: () => void;
  onUpgradeRequired: () => void;
  disabled?: boolean;
}

const SuperLikeButton = ({ onSuperLike, onUpgradeRequired, disabled }: SuperLikeButtonProps) => {
  const { canPerformAction, incrementUsage, getCurrentTier, dailyUsage } = useUserSubscription();
  const { toast } = useToast();

  const handleSuperLike = async () => {
    const tier = getCurrentTier();
    
    if (tier === 'free') {
      onUpgradeRequired();
      return;
    }

    if (!canPerformAction('super_likes')) {
      toast({
        title: "Daily Super Like Limit Reached",
        description: "You've used all your super likes for today. Upgrade to Pro for unlimited super likes!",
        variant: "destructive"
      });
      return;
    }

    const success = await incrementUsage('super_likes');
    if (success) {
      onSuperLike();
      toast({
        title: "Super Like Sent! ⚡",
        description: "Your super like has been sent. They'll know you're really interested!",
      });
    }
  };

  const getSuperLikesRemaining = () => {
    const tier = getCurrentTier();
    if (tier === 'free') return 0;
    if (tier === 'pro' || tier === 'vip') return -1; // unlimited
    if (tier === 'basic') return Math.max(0, 5 - dailyUsage.super_likes_used);
    return 0;
  };

  const superLikesRemaining = getSuperLikesRemaining();
  const isUnlimited = superLikesRemaining === -1;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleSuperLike}
        disabled={disabled || (superLikesRemaining === 0 && !isUnlimited)}
        className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
      >
        <Zap className="w-6 h-6 text-white" />
      </Button>
      
      <div className="text-center">
        <div className="text-xs font-medium text-blue-600">
          Super Like
        </div>
        {getCurrentTier() !== 'free' && (
          <div className="text-xs text-gray-500">
            {isUnlimited ? 'Unlimited' : `${superLikesRemaining} left`}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperLikeButton;
