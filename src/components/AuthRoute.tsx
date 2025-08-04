
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUserRoles } from "@/hooks/useUserRoles";

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !profileLoading && !rolesLoading && user) {
      // If user is admin, let them go to their intended destination (admin routes)
      // AdminRoute component will handle authentication and role verification
      if (isAdmin) {
        return; // Don't redirect admins, let them access admin routes
      }
      
      // For regular users, apply normal flow
      if (!profile) {
        navigate("/profile-setup", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [user, profile, authLoading, profileLoading, rolesLoading, isAdmin, navigate]);

  if (authLoading || profileLoading || rolesLoading) {
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
