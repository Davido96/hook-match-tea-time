
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Crown, UserPlus } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FollowSubscribeButtonsProps {
  targetUserId: string;
  targetUserType: 'creator' | 'consumer';
  subscriptionFee?: number;
  className?: string;
  size?: 'sm' | 'lg' | 'default';
  showBothButtons?: boolean;
}

const FollowSubscribeButtons = ({ 
  targetUserId, 
  targetUserType, 
  subscriptionFee, 
  className = "",
  size = "sm",
  showBothButtons = true
}: FollowSubscribeButtonsProps) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing, loading: followLoading } = useFollows();
  const { subscribeToCreator, isSubscribed, loading: subscribeLoading } = useSubscriptions();
  const [userIsFollowing, setUserIsFollowing] = useState(false);
  const [userIsSubscribed, setUserIsSubscribed] = useState(false);
  const [showSubscribeButton, setShowSubscribeButton] = useState(true);

  useEffect(() => {
    if (user && targetUserId) {
      checkFollowStatus();
      checkSubscriptionStatus();
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const following = await isFollowing(targetUserId);
      setUserIsFollowing(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const subscribed = await isSubscribed(targetUserId);
      setUserIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription status:', error);
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

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("Please login to subscribe");
      return;
    }

    try {
      // For now, we'll use a default plan. In a real app, you'd select a plan
      const defaultPlanId = "default-plan-id";
      await subscribeToCreator(targetUserId, defaultPlanId);
      setUserIsSubscribed(true);
      toast.success("Subscribed successfully");
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error("Failed to subscribe");
    }
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
    <div className={cn("flex gap-2", className)}>
      {/* Follow Button - Always show for all user types */}
      <Button
        variant={userIsFollowing ? "default" : "outline"}
        size={size}
        onClick={handleToggleFollow}
        disabled={followLoading}
        className={cn(
          buttonSizeClasses[size],
          userIsFollowing 
            ? "bg-hooks-coral text-white hover:bg-hooks-coral/90" 
            : "border-hooks-coral text-hooks-coral hover:bg-hooks-coral hover:text-white"
        )}
      >
        {followLoading ? (
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

      {/* Subscribe Button - Show for creators with subscription fee, or always if showBothButtons is true */}
      {showBothButtons && (targetUserType === 'creator' || subscriptionFee) && showSubscribeButton && (
        <Button
          variant={userIsSubscribed ? "default" : "outline"}
          size={size}
          onClick={handleSubscribe}
          disabled={subscribeLoading}
          className={cn(
            buttonSizeClasses[size],
            userIsSubscribed 
              ? "bg-gradient-to-r from-hooks-coral to-hooks-pink text-white" 
              : "border-hooks-pink text-hooks-pink hover:bg-hooks-pink hover:text-white"
          )}
        >
          {subscribeLoading ? (
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
          ) : (
            <>
              <Crown className={cn(iconSizeClasses[size], "mr-1")} />
              {userIsSubscribed ? "Subscribed" : `Subscribe${subscriptionFee ? ` (${subscriptionFee} Keys)` : ''}`}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FollowSubscribeButtons;
