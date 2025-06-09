
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import ProfileModal from "./ProfileModal";

const ProfileButton = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [showProfile, setShowProfile] = useState(false);

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowProfile(true)}
        className="p-1"
      >
        <Avatar className="w-8 h-8">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
      </Button>
      
      {showProfile && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </>
  );
};

export default ProfileButton;
