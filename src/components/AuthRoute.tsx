
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading && user) {
      if (!profile) {
        navigate("/profile-setup", { replace: true });
      } else {
        navigate("/app", { replace: true });
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

  if (user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthRoute;
