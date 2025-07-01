
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

interface ProfileRequiredRouteProps {
  children: React.ReactNode;
}

const ProfileRequiredRoute = ({ children }: ProfileRequiredRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate("/auth/signin", { replace: true });
      } else if (!profile) {
        navigate("/profile-setup", { replace: true });
      }
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return <>{children}</>;
};

export default ProfileRequiredRoute;
