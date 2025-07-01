
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useUserPresence } from "@/hooks/useUserPresence";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { updateStreak } = useActivityTracker();
  const { updatePresence } = useUserPresence();
  const navigate = useNavigate();

  // Initialize activity tracking and presence when user logs in
  useEffect(() => {
    if (user && profile) {
      updateStreak();
      updatePresence(true);
    }
  }, [user, profile, updateStreak, updatePresence]);

  // Handle navigation based on auth and profile state
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate("/", { replace: true });
        return;
      }
      
      if (user && !profile) {
        navigate("/profile-setup", { replace: true });
        return;
      }
      
      if (user && profile) {
        navigate("/app", { replace: true });
        return;
      }
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  // Show loading while checking auth/profile state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return null;
};

export default Index;
