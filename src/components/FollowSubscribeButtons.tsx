
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFollows } from "@/hooks/useFollows";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, HeartOff, Crown, X, Loader2 } from "lucide-react";

interface FollowSubscribeButtonsProps {
  targetUserId: string;
  targetUserType: 'creator' | 'consumer';
  subscriptionFee?: number;
  className?: string;
  onSubscriptionChange?: () => void;
}

const FollowSubscribeButtons = ({ 
  targetUserId, 
  targetUserType, 
  subscriptionFee = 0,
  className = "",
  onSubscriptionChange
}: FollowSubscribeButtonsProps) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing, loading: followLoading } = useFollows();
  const { subscribeToCreator, unsubscribeFromCreator, isSubscribed, loading: subscribeLoading } = useSubscriptions();
  const { fetchCreatorPlans } = useSubscriptionPlans();
  const { toast } = useToast();
  
  const [isCurrentlyFollowing, setIsCurrentlyFollowing] = useState(false);
  const [isCurrentlySubscribed, setIsCurrentlySubscribed] = useState(false);
  const [defaultPlan, setDefaultPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || user.id === targetUserId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Checking follow/subscribe status for user:', targetUserId);
        
        const [followStatus, subscribeStatus, creatorPlans] = await Promise.all([
          isFollowing(targetUserId),
          targetUserType === 'creator' ? isSubscribed(targetUserId) : Promise.resolve(false),
          targetUserType === 'creator' ? fetchCreatorPlans(targetUserId) : Promise.resolve([])
        ]);

        console.log('Status results - Follow:', followStatus, 'Subscribe:', subscribeStatus, 'Plans:', creatorPlans.length);

        setIsCurrentlyFollowing(followStatus);
        setIsCurrentlySubscribed(subscribeStatus);
        
        // Set default plan (first active plan)
        if (creatorPlans.length > 0) {
          setDefaultPlan(creatorPlans[0]);
        } else if (targetUserType === 'creator') {
          console.warn('No subscription plans found for creator:', targetUserId);
        }
      } catch (error) {
        console.error('Error checking follow/subscribe status:', error);
        toast({
          title: "Error",
          description: "Failed to load user status. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user, targetUserId, targetUserType, isFollowing, isSubscribed, fetchCreatorPlans]);

  if (!user || user.id === targetUserId || loading) {
    return null;
  }

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow users.",
        variant: "destructive"
      });
      return;
    }

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
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('Follow error:', error);
      
      let errorMessage = error.message || "Failed to update follow status";
      
      // Handle specific error cases
      if (errorMessage.includes("already following")) {
        setIsCurrentlyFollowing(true);
        errorMessage = "You are already following this user";
      } else if (errorMessage.includes("not authenticated") || errorMessage.includes("logged in")) {
        errorMessage = "Please log in to follow users";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });

      // Retry logic for network errors
      if (retryCount < 2 && (errorMessage.includes("network") || errorMessage.includes("connection"))) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => handleFollow(), 1000);
      }
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to creators.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isCurrentlySubscribed) {
        await unsubscribeFromCreator(targetUserId);
        setIsCurrentlySubscribed(false);
        toast({
          title: "Unsubscribed",
          description: "You have unsubscribed from this creator."
        });
      } else {
        if (!defaultPlan) {
          toast({
            title: "No Plans Available",
            description: "This creator hasn't set up any subscription plans yet.",
            variant: "destructive"
          });
          return;
        }
        
        await subscribeToCreator(targetUserId, defaultPlan.id);
        setIsCurrentlySubscribed(true);
        toast({
          title: "Subscribed",
          description: `You are now subscribed to this creator for ${defaultPlan.price_keys} Keys!`
        });
      }
      
      // Call the callback if provided
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('Subscribe error:', error);
      
      let errorMessage = error.message || "Failed to update subscription status";
      
      // Handle specific error cases
      if (errorMessage.includes("already subscribed")) {
        setIsCurrentlySubscribed(true);
        errorMessage = "You are already subscribed to this creator";
      } else if (errorMessage.includes("Insufficient balance")) {
        errorMessage = error.message; // Use the detailed balance message
      } else if (errorMessage.includes("not authenticated") || errorMessage.includes("logged in")) {
        errorMessage = "Please log in to subscribe to creators";
      }
      
      toast({
        title: "Subscription Error",
        description: errorMessage,
        variant: "destructive"
      });

      // Retry logic for network errors
      if (retryCount < 2 && (errorMessage.includes("network") || errorMessage.includes("connection"))) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => handleSubscribe(), 1000);
      }
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
        {followLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isCurrentlyFollowing ? (
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
          disabled={subscribeLoading || (!defaultPlan && !isCurrentlySubscribed)}
          className="flex items-center gap-2"
        >
          {subscribeLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isCurrentlySubscribed ? (
            <>
              <X className="w-4 h-4" />
              Unsubscribe
            </>
          ) : defaultPlan ? (
            <>
              <Crown className="w-4 h-4" />
              Subscribe ({defaultPlan.price_keys} Keys)
            </>
          ) : (
            <>
              <Crown className="w-4 h-4" />
              No Plans Available
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FollowSubscribeButtons;
