
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import LandingPage from "@/components/LandingPage";
import ProfileSetup from "@/components/ProfileSetup";
import EnhancedDiscoveryInterface from "@/components/EnhancedDiscoveryInterface";

const Index = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hooks-coral"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <EnhancedDiscoveryInterface />
      </div>
    </div>
  );
};

export default Index;
