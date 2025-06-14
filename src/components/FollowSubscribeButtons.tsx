
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFollows } from "@/hooks/useFollows";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, HeartOff, Crown, X } from "lucide-react";

interface FollowSubscribeButtonsProps {
  targetUserId: string;
  targetUserType: 'creator' | 'consumer';
  subscriptionFee?: number;
  className?: string;
}

const FollowSubscribeButtons = ({ 
  targetUserId, 
  targetUserType, 
  subscriptionFee = 0,
  className = "" 
}: FollowSubscribeButtonsProps) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing, loading: followLoading } = useFollows();
  const { subscribeToCreator, unsubscribeFromCreator, isSubscribed, loading: subscribeLoading } = useSubscriptions();
  const { toast } = useToast();
  
  const [isCurrentlyFollowing, setIsCurrentlyFollowing] = useState(false);
  const [isCurrentlySubscribed, setIsCurrentlySubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || user.id === targetUserId) {
        setLoading(false);
        return;
      }

      try {
        const [followStatus, subscribeStatus] = await Promise.all([
          isFollowing(targetUserId),
          targetUserType === 'creator' ? isSubscribed(targetUserId) : Promise.resolve(false)
        ]);

        setIsCurrentlyFollowing(followStatus);
        setIsCurrentlySubscribed(subscribeStatus);
      } catch (error) {
        console.error('Error checking follow/subscribe status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, targetUserId, targetUserType, isFollowing, isSubscribed]);

  if (!user || user.id === targetUserId || loading) {
    return null;
  }

  const handleFollow = async () => {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(targetUserId);
        setIsCurrentlyFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user."
        });
      } else {
        await followUser(targetUserId);
        setIsCurrentlyFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this user."
        });
      }
    } catch (error: any) {
      console.error('Follow error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  const handleSubscribe = async () => {
    try {
      if (isCurrentlySubscribed) {
        await unsubscribeFromCreator(targetUserId);
        setIsCurrentlySubscribed(false);
        toast({
          title: "Unsubscribed",
          description: "You have unsubscribed from this creator."
        });
      } else {
        await subscribeToCreator(targetUserId, subscriptionFee);
        setIsCurrentlySubscribed(true);
        toast({
          title: "Subscribed",
          description: "You are now subscribed to this creator!"
        });
      }
    } catch (error: any) {
      console.error('Subscribe error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Follow Button - Available for all users */}
      <Button
        variant={isCurrentlyFollowing ? "secondary" : "outline"}
        size="sm"
        onClick={handleFollow}
        disabled={followLoading}
        className="flex items-center gap-2"
      >
        {isCurrentlyFollowing ? (
          <>
            <HeartOff className="w-4 h-4" />
            Unfollow
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" />
            Follow
          </>
        )}
      </Button>

      {/* Subscribe Button - Only for creators */}
      {targetUserType === 'creator' && (
        <Button
          variant={isCurrentlySubscribed ? "secondary" : "default"}
          size="sm"
          onClick={handleSubscribe}
          disabled={subscribeLoading}
          className="flex items-center gap-2"
        >
          {isCurrentlySubscribed ? (
            <>
              <X className="w-4 h-4" />
              Unsubscribe
            </>
          ) : (
            <>
              <Crown className="w-4 h-4" />
              Subscribe ({subscriptionFee} Keys)
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FollowSubscribeButtons;
