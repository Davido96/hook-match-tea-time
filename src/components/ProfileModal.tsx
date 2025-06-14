
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, MapPin, Calendar, Edit, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import EditProfileModal from "./EditProfileModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { wallet } = useWallet();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleViewFullProfile = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Profile</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="text-center">
              <Avatar className="w-20 h-20 mx-auto mb-3">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.name} />
                <AvatarFallback className="bg-hooks-coral text-white text-2xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <Badge className={profile.user_type === 'creator' ? 'bg-hooks-coral' : 'bg-hooks-blue'}>
                {profile.user_type === 'creator' ? 'Content Creator' : 'Premium Member'}
              </Badge>
            </div>

            {/* Profile Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{profile.age} years old</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{profile.location_city}, {profile.location_state}</span>
              </div>
              {profile.bio && (
                <p className="text-sm text-gray-600">{profile.bio}</p>
              )}
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Creator Info */}
            {profile.user_type === 'creator' && (
              <div>
                <h4 className="font-semibold mb-2">Creator Info</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>Status:</span>
                    <Badge variant={profile.verification_status === 'verified' ? 'default' : 'outline'}>
                      {profile.verification_status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Keys Balance</span>
                <span className="text-hooks-coral font-bold">{wallet?.keys_balance || 0} 🪝</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleViewFullProfile}
              >
                <User className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowEditProfile(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
};

export default ProfileModal;
