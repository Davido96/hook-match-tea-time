
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Calendar, Heart, UserPlus, UserMinus, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useFollows } from "@/hooks/useFollows";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useToast } from "@/hooks/use-toast";

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

const ProfileViewModal = ({ isOpen, onClose, profile }: ProfileViewModalProps) => {
  const { user } = useAuth();
  const { profile: currentUserProfile } = useProfile();
  const { followUser, unfollowUser, isFollowing, loading: followLoading } = useFollows();
  const { subscribeToCreator, unsubscribeFromCreator, isSubscribed, loading: subscriptionLoading } = useSubscriptions();
  const { toast } = useToast();
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [isSubscribedToProfile, setIsSubscribedToProfile] = useState(false);

  useEffect(() => {
    if (user && profile) {
      checkFollowStatus();
      checkSubscriptionStatus();
    }
  }, [user, profile]);

  const checkFollowStatus = async () => {
    if (user && profile) {
      const following = await isFollowing(profile.id);
      setIsFollowingProfile(following);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (user && profile) {
      const subscribed = await isSubscribed(profile.id);
      setIsSubscribedToProfile(subscribed);
    }
  };

  const handleFollow = async () => {
    if (!user || !currentUserProfile) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFollowingProfile) {
        await unfollowUser(profile.id);
        setIsFollowingProfile(false);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${profile.name}`,
        });
      } else {
        await followUser(profile.id);
        setIsFollowingProfile(true);
        toast({
          title: "Following",
          description: `You are now following ${profile.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  const handleSubscribe = async () => {
    if (!user || !currentUserProfile) {
      toast({
        title: "Authentication required",
        description: "Please log in to subscribe",
        variant: "destructive"
      });
      return;
    }

    if (currentUserProfile.user_type !== 'consumer') {
      toast({
        title: "Subscription not available",
        description: "Only members can subscribe to creators",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isSubscribedToProfile) {
        await unsubscribeFromCreator(profile.id);
        setIsSubscribedToProfile(false);
        toast({
          title: "Unsubscribed",
          description: `You have unsubscribed from ${profile.name}`,
        });
      } else {
        await subscribeToCreator(profile.id, profile.subscriptionFee || 0);
        setIsSubscribedToProfile(true);
        toast({
          title: "Subscribed",
          description: `You are now subscribed to ${profile.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive"
      });
    }
  };

  if (!isOpen || !profile) return null;

  const isCreator = profile.isVerified; // Using isVerified as creator indicator for sample data
  const isOwnProfile = user && currentUserProfile && profile.id === currentUserProfile.id;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Profile Image and Basic Info */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <img
                src={profile.images?.[0] || "/placeholder.svg"}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-hooks-coral"
              />
              {isCreator && (
                <Crown className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 bg-white rounded-full p-1" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge className={isCreator ? 'bg-hooks-coral' : 'bg-hooks-blue'}>
                {isCreator ? 'Content Creator' : 'Member'}
              </Badge>
              {profile.isVerified && (
                <Badge className="bg-blue-500 text-white">
                  ✓ Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{profile.age} years old</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Creator Subscription Info */}
          {isCreator && (
            <div className="bg-hooks-coral/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-hooks-coral">Creator Subscription</h4>
              <div className="text-lg font-bold text-hooks-coral">
                ₦{profile.subscriptionFee?.toLocaleString() || '0'}/month
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Get exclusive access to premium content
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="space-y-3">
              {/* Follow Button */}
              <Button
                onClick={handleFollow}
                disabled={followLoading}
                className={`w-full ${
                  isFollowingProfile 
                    ? 'bg-gray-500 hover:bg-gray-600' 
                    : 'gradient-coral'
                }`}
              >
                {followLoading ? (
                  'Loading...'
                ) : isFollowingProfile ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>

              {/* Subscribe Button (only for creators) */}
              {isCreator && (
                <Button
                  onClick={handleSubscribe}
                  disabled={subscriptionLoading}
                  variant={isSubscribedToProfile ? "outline" : "default"}
                  className={`w-full ${!isSubscribedToProfile ? 'gradient-coral' : ''}`}
                >
                  {subscriptionLoading ? (
                    'Loading...'
                  ) : isSubscribedToProfile ? (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Unsubscribe
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe for ₦{profile.subscriptionFee?.toLocaleString() || '0'}/month
                    </>
                  )}
                </Button>
              )}

              {/* Message Button */}
              <Button variant="outline" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-hooks-coral">12</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-hooks-coral">234</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-hooks-coral">45</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileViewModal;
