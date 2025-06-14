import { Button } from "@/components/ui/button";
import { Heart, Users, Shield, Zap } from "lucide-react";
import { useState } from "react";
import AuthPage from "@/components/AuthPage";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";
import { useAuth } from "@/contexts/AuthContext";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const { user, signOut } = useAuth();

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuth(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    // Call the parent's onGetStarted to handle the redirect
    onGetStarted();
  };

  const handleSignupSuccess = () => {
    setShowAuth(false);
    setShowProfileSetup(true);
  };

  const handleProfileSetupComplete = () => {
    setShowProfileSetup(false);
    onGetStarted();
  };

  const handleBackToAuth = () => {
    setShowProfileSetup(false);
    setShowAuth(true);
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
    setShowProfileSetup(false);
  };

  if (showProfileSetup) {
    return (
      <EnhancedProfileSetup 
        onComplete={handleProfileSetupComplete} 
        onBack={handleBackToAuth}
      />
    );
  }

  if (showAuth) {
    return (
      <AuthPage 
        initialMode={authMode} 
        onAuthSuccess={handleAuthSuccess}
        onSignupSuccess={handleSignupSuccess}
        onBack={handleBackToLanding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <span className="text-6xl">🪝</span>
            <h1 className="text-6xl font-bold text-white">Hooks</h1>
          </div>
          <p className="text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Connect with amazing creators and find meaningful relationships in Nigeria's premier dating platform
          </p>
          
          {/* Show different buttons based on auth state */}
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="bg-white text-hooks-coral hover:bg-gray-100 text-xl px-12 py-6 rounded-full font-semibold"
              >
                Continue to App
              </Button>
              <Button
                onClick={handleSignOut}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-hooks-coral text-xl px-12 py-6 rounded-full font-semibold"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-hooks-coral hover:bg-gray-100 text-xl px-12 py-6 rounded-full font-semibold"
            >
              Get Started
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Matching</h3>
            <p className="text-white/80">Advanced algorithm to find your perfect match based on interests and preferences</p>
          </div>

          <div className="text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Creator Network</h3>
            <p className="text-white/80">Connect with content creators and access exclusive premium content</p>
          </div>

          <div className="text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Safe & Secure</h3>
            <p className="text-white/80">Verified profiles and secure platform for peace of mind dating</p>
          </div>

          <div className="text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant Connect</h3>
            <p className="text-white/80">Real-time messaging and video calls to connect instantly</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Find Love?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of users who have found their perfect match on Hooks</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user && (
              <>
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-white text-hooks-coral hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold"
                >
                  Sign Up Free
                </Button>
                <Button
                  onClick={handleSignIn}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-hooks-coral text-lg px-8 py-4 rounded-full font-semibold"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
