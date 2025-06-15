
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Crown, UserPlus, RefreshCw } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SubscriptionPlanModal from "./SubscriptionPlanModal";

interface FollowSubscribeButtonsProps {
  targetUserId: string;
  targetUserType: 'creator' | 'consumer';
  targetUserName?: string;
  subscriptionFee?: number;
  className?: string;
  size?: 'sm' | 'lg' | 'default';
  showBothButtons?: boolean;
}

const FollowSubscribeButtons = ({ 
  targetUserId, 
  targetUserType, 
  targetUserName = "Creator",
  subscriptionFee, 
  className = "",
  size = "sm",
  showBothButtons = true
}: FollowSubscribeButtonsProps) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing, loading: followLoading } = useFollows();
  const { isSubscribed, loading: subscribeLoading } = useSubscriptions();
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  const [userIsSubscribed, setUserIsSubscribed] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    if (user && targetUserId) {
      checkAllStatus();
    }
  }, [user, targetUserId]);

  const checkAllStatus = async () => {
    setStatusLoading(true);
    setSubscriptionError(null);
    try {
      await Promise.all([
        checkFollowStatus(),
        checkSubscriptionStatus()
      ]);
    } catch (error) {
      console.error('Error checking status:', error);
      setSubscriptionError('Failed to load status');
    } finally {
      setStatusLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      console.log('Checking follow status for user:', targetUserId);
      const following = await isFollowing(targetUserId);
      console.log('Follow status result:', following);
      setUserIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      console.log('Checking subscription status for user:', targetUserId);
      const subscribed = await isSubscribed(targetUserId);
      console.log('Subscription status result:', subscribed);
      setUserIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setSubscriptionError('Failed to check subscription status');
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow users");
      return;
    }

    try {
      if (userIsFollowing) {
        await unfollowUser(targetUserId);
        setUserIsFollowing(false);
        toast.success("Unfollowed successfully");
      } else {
        await followUser(targetUserId);
        setUserIsFollowing(true);
        toast.success("Following successfully");
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error("Failed to update follow status");
    }
  };

  const handleSubscribeClick = () => {
    if (!user) {
      toast.error("Please login to subscribe");
      return;
    }

    if (userIsSubscribed) {
      toast.info("You are already subscribed to this creator");
      return;
    }

    console.log('Opening subscription modal for creator:', targetUserId);
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionComplete = () => {
    console.log('Subscription completed, refreshing status');
    setUserIsSubscribed(true);
    checkSubscriptionStatus(); // Refresh status
  };

  if (!user || user.id === targetUserId) {
    return null;
  }

  const buttonSizeClasses = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 text-sm", 
    lg: "h-12 px-6 text-base"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    default: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <>
      <div className={cn("flex gap-2", className)}>
        {/* Follow Button - Always show for all user types */}
        <Button
          variant={userIsFollowing ? "default" : "outline"}
          size={size}
          onClick={handleToggleFollow}
          disabled={followLoading || statusLoading}
          className={cn(
            buttonSizeClasses[size],
            userIsFollowing 
              ? "bg-hooks-coral text-white hover:bg-hooks-coral/90" 
              : "border-hooks-coral text-hooks-coral hover:bg-hooks-coral hover:text-white"
          )}
        >
          {followLoading || statusLoading ? (
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
          ) : (
            <>
              {userIsFollowing ? (
                <Heart className={cn(iconSizeClasses[size], "mr-1 fill-current")} />
              ) : (
                <UserPlus className={cn(iconSizeClasses[size], "mr-1")} />
              )}
              {userIsFollowing ? "Following" : "Follow"}
            </>
          )}
        </Button>

        {/* Subscribe Button - Show for creators */}
        {showBothButtons && targetUserType === 'creator' && (
          <Button
            variant={userIsSubscribed ? "default" : "outline"}
            size={size}
            onClick={handleSubscribeClick}
            disabled={subscribeLoading || statusLoading}
            className={cn(
              buttonSizeClasses[size],
              userIsSubscribed 
                ? "bg-gradient-to-r from-hooks-coral to-hooks-pink text-white" 
                : "border-hooks-pink text-hooks-pink hover:bg-hooks-pink hover:text-white"
            )}
          >
            {subscribeLoading || statusLoading ? (
              <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
            ) : (
              <>
                <Crown className={cn(iconSizeClasses[size], "mr-1")} />
                {userIsSubscribed ? "Subscribed" : "Subscribe"}
              </>
            )}
          </Button>
        )}

        {subscriptionError && (
          <Button
            variant="ghost"
            size={size}
            onClick={checkAllStatus}
            className={cn(buttonSizeClasses[size], "text-red-500")}
          >
            <RefreshCw className={cn(iconSizeClasses[size], "mr-1")} />
            Retry
          </Button>
        )}
      </div>

      {/* Subscription Plan Modal */}
      <SubscriptionPlanModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        creatorId={targetUserId}
        creatorName={targetUserName}
        onSubscriptionComplete={handleSubscriptionComplete}
      />
    </>
  );
};

export default FollowSubscribeButtons;
