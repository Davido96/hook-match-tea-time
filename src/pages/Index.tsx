
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import AuthPage from "@/components/AuthPage";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";
import ExclusiveContentPage from "@/components/ExclusiveContentPage";
import LandingPage from "@/components/LandingPage";
import DiscoverPage from "@/components/DiscoverPage";
import ChatInterface from "@/components/ChatInterface";

type ViewType = 'landing' | 'discover' | 'exclusive' | 'profile-setup' | 'messages' | 'auth';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [matches, setMatches] = useState<any[]>([]);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Handle navigation based on auth and profile state
  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      // No user - show landing page
      setCurrentView('landing');
      return;
    }
    
    if (user && !profile) {
      // User exists but no profile - show profile setup
      setCurrentView('profile-setup');
      return;
    }
    
    if (user && profile) {
      // User and profile exist - show discover if currently on landing/auth
      if (currentView === 'landing' || currentView === 'auth' || currentView === 'profile-setup') {
        setCurrentView('discover');
      }
      return;
    }
  }, [user, profile, authLoading, profileLoading, currentView]);

  const handleGetStarted = () => {
    setAuthMode('signup');
    setCurrentView('auth');
  };

  const handleSignInClick = () => {
    setAuthMode('signin');
    setCurrentView('auth');
  };

  const handleAuthSuccess = () => {
    // Will be handled by useEffect based on profile state
  };

  const handleSignupSuccess = () => {
    // After successful signup, useEffect will direct to profile setup
  };

  const handleProfileSetupComplete = () => {
    setCurrentView('discover');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleMatchAdded = (match: any) => {
    setMatches(prev => [...prev, match]);
  };

  // Show loading while checking auth/profile state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show authentication page
  if (currentView === 'auth') {
    return (
      <AuthPage 
        initialMode={authMode}
        onAuthSuccess={handleAuthSuccess}
        onSignupSuccess={handleSignupSuccess}
        onBack={handleBackToLanding}
      />
    );
  }

  // Show landing page if no user or explicitly requested
  if (!user || currentView === 'landing') {
    return (
      <LandingPage 
        onGetStarted={handleGetStarted}
        onSignIn={handleSignInClick}
      />
    );
  }

  // Show profile setup if user exists but no profile
  if (currentView === 'profile-setup') {
    return (
      <EnhancedProfileSetup 
        onComplete={handleProfileSetupComplete}
        onBack={handleBackToLanding}
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
