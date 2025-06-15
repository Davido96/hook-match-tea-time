
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useUserPresence } from "@/hooks/useUserPresence";
import AuthPage from "@/components/AuthPage";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";
import ExclusiveContentPage from "@/components/ExclusiveContentPage";
import LandingPage from "@/components/LandingPage";
import DiscoverPage from "@/components/DiscoverPage";
import ChatInterface from "@/components/ChatInterface";

type ViewType = 'landing' | 'discover' | 'exclusive' | 'profile-setup' | 'messages';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { updateStreak } = useActivityTracker();
  const { updatePresence } = useUserPresence();
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [matches, setMatches] = useState<any[]>([]);
  const [forceShowLanding, setForceShowLanding] = useState(false);

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
      // If force showing landing, respect that
      if (forceShowLanding) {
        setCurrentView('landing');
        return;
      }

      if (!user) {
        setCurrentView('landing');
        return;
      }
      
      // If user exists but no profile, show profile setup
      if (user && !profile) {
        setCurrentView('profile-setup');
        return;
      }
      
      // If user and profile exist, and we're still on landing, go to discover
      if (user && profile && currentView === 'landing') {
        setCurrentView('discover');
        return;
      }
    }
  }, [user, profile, authLoading, profileLoading, currentView, forceShowLanding]);

  const handleGetStarted = () => {
    setForceShowLanding(false);
    // This will be called from LandingPage when user clicks get started
    // If user is authenticated and has profile, go directly to discover
    if (user && profile) {
      setCurrentView('discover');
    } else if (user && !profile) {
      setCurrentView('profile-setup');
    } else {
      // User needs to authenticate first - this is handled by LandingPage
      setCurrentView('landing');
    }
  };

  const handleProfileSetupComplete = () => {
    setCurrentView('discover');
  };

  const handleProfileSetupBack = () => {
    // This allows users to go back to landing from profile setup
    setForceShowLanding(true);
    setCurrentView('landing');
  };

  const handleMatchAdded = (match: any) => {
    setMatches(prev => [...prev, match]);
  };

  const handleBackToLanding = () => {
    setForceShowLanding(true);
    setCurrentView('landing');
  };

  // Show loading while checking auth/profile state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show landing page if no user or force showing landing
  if (!user || currentView === 'landing' || forceShowLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show profile setup if user exists but no profile
  if (currentView === 'profile-setup') {
    return (
      <EnhancedProfileSetup 
        onComplete={handleProfileSetupComplete}
        onBack={handleProfileSetupBack}
      />
    );
  }

  // Show exclusive content page
  if (currentView === 'exclusive') {
    return <ExclusiveContentPage onBack={() => setCurrentView('discover')} />;
  }

  // Show messages interface
  if (currentView === 'messages') {
    return <ChatInterface onBack={() => setCurrentView('discover')} matches={matches} />;
  }

  // Main discover interface - this is the homepage after authentication
  return (
    <DiscoverPage 
      currentView={currentView}
      setCurrentView={setCurrentView}
      matches={matches}
      onMatchAdded={handleMatchAdded}
    />
  );
};

export default Index;
