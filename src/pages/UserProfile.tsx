import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Calendar, Users, Heart, MessageCircle, Share } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useFollows } from "@/hooks/useFollows";
import FollowSubscribeButtons from "@/components/FollowSubscribeButtons";
import ProfilePostTimeline from "@/components/ProfilePostTimeline";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  bio?: string;
  user_type: 'creator' | 'consumer';
  location_state: string;
  location_city: string;
  avatar_url?: string;
  verification_status: string;
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubscribed } = useSubscriptions();
  const { getFollowCounts } = useFollows();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [userIsSubscribed, setUserIsSubscribed] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
      fetchFollowCounts();
      checkSubscriptionStatus();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      // Type the user_type properly
      const profileData: UserProfile = {
        ...data,
        user_type: data.user_type as 'creator' | 'consumer'
      };
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowCounts = async () => {
    if (userId) {
      const counts = await getFollowCounts(userId);
      setFollowCounts(counts);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (userId && user) {
      const subscribed = await isSubscribed(userId);
      setUserIsSubscribed(subscribed);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <p className="text-sm text-gray-500">
                {profile.user_type === 'creator' ? 'Content Creator' : 'Premium Member'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and basic info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.name} />
                <AvatarFallback className="bg-hooks-coral text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {user && user.id !== userId && (
                <FollowSubscribeButtons
                  targetUserId={userId!}
                  targetUserType={profile.user_type}
                  className="w-full md:w-auto"
                />
              )}
            </div>

            {/* Profile details */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{profile.age} years old</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location_city}, {profile.location_state}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={profile.user_type === 'creator' ? 'bg-hooks-coral' : 'bg-hooks-blue'}>
                    {profile.user_type === 'creator' ? 'Creator' : 'Member'}
                  </Badge>
                  {profile.verification_status === 'verified' && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <span className="font-semibold">{followCounts.following}</span>
                  <span className="text-gray-600 ml-1">Following</span>
                </div>
                <div>
                  <span className="font-semibold">{followCounts.followers}</span>
                  <span className="text-gray-600 ml-1">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Timeline */}
      <ProfilePostTimeline 
        userId={userId!} 
        isSubscribed={userIsSubscribed}
        isOwnProfile={user?.id === userId}
      />
    </div>
  );
};

export default UserProfile;
