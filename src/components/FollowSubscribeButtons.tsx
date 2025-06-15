
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Crown, UserPlus } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface FollowSubscribeButtonsProps {
  targetUserId: string;
  targetUserType: 'creator' | 'consumer';
  subscriptionFee?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
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
  const { isFollowing, toggleFollow, loading: followLoading } = useFollows(targetUserId);
  const { isSubscribed, subscribe, loading: subscribeLoading } = useSubscriptions(targetUserId);
  const [showSubscribeButton, setShowSubscribeButton] = useState(true);

  if (!user || user.id === targetUserId) {
    return null;
  }

  const buttonSizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm", 
    lg: "h-12 px-6 text-base"
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <div className={cn("flex gap-2", className)}>
      {/* Follow Button - Always show for all user types */}
      <Button
        variant={isFollowing ? "default" : "outline"}
        size={size}
        onClick={toggleFollow}
        disabled={followLoading}
        className={cn(
          buttonSizeClasses[size],
          isFollowing 
            ? "bg-hooks-coral text-white hover:bg-hooks-coral/90" 
            : "border-hooks-coral text-hooks-coral hover:bg-hooks-coral hover:text-white"
        )}
      >
        {followLoading ? (
          <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
        ) : (
          <>
            {isFollowing ? (
              <Heart className={cn(iconSizeClasses[size], "mr-1 fill-current")} />
            ) : (
              <UserPlus className={cn(iconSizeClasses[size], "mr-1")} />
            )}
            {isFollowing ? "Following" : "Follow"}
          </>
        )}
      </Button>

      {/* Subscribe Button - Show for creators with subscription fee, or always if showBothButtons is true */}
      {showBothButtons && (targetUserType === 'creator' || subscriptionFee) && showSubscribeButton && (
        <Button
          variant={isSubscribed ? "default" : "outline"}
          size={size}
          onClick={() => subscribe()}
          disabled={subscribeLoading}
          className={cn(
            buttonSizeClasses[size],
            isSubscribed 
              ? "bg-gradient-to-r from-hooks-coral to-hooks-pink text-white" 
              : "border-hooks-pink text-hooks-pink hover:bg-hooks-pink hover:text-white"
          )}
        >
          {subscribeLoading ? (
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
          ) : (
            <>
              <Crown className={cn(iconSizeClasses[size], "mr-1")} />
              {isSubscribed ? "Subscribed" : `Subscribe${subscriptionFee ? ` (${subscriptionFee} Keys)` : ''}`}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FollowSubscribeButtons;
