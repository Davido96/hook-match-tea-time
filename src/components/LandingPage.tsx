
import { Button } from "@/components/ui/button";
import { Heart, Users, Shield, Zap, Star, TrendingUp } from "lucide-react";
import { useState } from "react";
import AuthPage from "@/components/AuthPage";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";
import { useAuth } from "@/contexts/AuthContext";
import CreatorShowcase from "@/components/CreatorShowcase";
import FloatingStats from "@/components/FloatingStats";
import InteractiveButton from "@/components/InteractiveButton";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [userType, setUserType] = useState<'creator' | 'consumer' | null>(null);
  const { user, signOut } = useAuth();

  const handleGetStarted = (type: 'creator' | 'consumer') => {
    setUserType(type);
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
    setUserType(null);
  };

  if (showProfileSetup) {
    return (
      <div className="page-transition">
        <EnhancedProfileSetup 
          onComplete={handleProfileSetupComplete} 
          onBack={handleBackToAuth}
        />
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="page-transition">
        <AuthPage 
          initialMode={authMode} 
          onAuthSuccess={handleAuthSuccess}
          onSignupSuccess={handleSignupSuccess}
          onBack={handleBackToLanding}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple relative overflow-hidden">
      {/* Floating Stats */}
      <FloatingStats />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-8 animate-fade-in">
            <span className="text-6xl animate-float">🪝</span>
            <h1 className="text-6xl font-bold text-white font-playfair">Hooks</h1>
          </div>
          <p className="text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
            Empowering Black creators to build meaningful connections and monetize their content
          </p>
          
          {/* Dual CTA for Creators vs Consumers */}
          {user ? (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <InteractiveButton
                onClick={onGetStarted}
                variant="primary"
                size="hero"
              >
                Continue to App
              </InteractiveButton>
              <InteractiveButton
                onClick={handleSignOut}
                variant="outline"
                size="hero"
              >
                Sign Out
              </InteractiveButton>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6 justify-center items-center max-w-4xl mx-auto">
                <div className="group creator-cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105">
                  <div className="text-center mb-6">
                    <Star className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">For Creators</h3>
                    <p className="text-white/80 mb-4">Monetize your content and build your audience</p>
                    <div className="text-sm text-white/70 mb-4">
                      • Earn up to ₦500K monthly
                      • Keep 80% of your earnings
                      • Direct fan engagement
                    </div>
                  </div>
                  <InteractiveButton
                    onClick={() => handleGetStarted('creator')}
                    variant="creator"
                    size="large"
                    className="w-full"
                  >
                    Start Creating
                  </InteractiveButton>
                </div>

                <div className="group consumer-cta-card bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105">
                  <div className="text-center mb-6">
                    <Heart className="w-12 h-12 text-red-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">For Fans</h3>
                    <p className="text-white/80 mb-4">Connect with amazing creators</p>
                    <div className="text-sm text-white/70 mb-4">
                      • Exclusive content access
                      • Direct creator interaction
                      • Premium experiences
                    </div>
                  </div>
                  <InteractiveButton
                    onClick={() => handleGetStarted('consumer')}
                    variant="consumer"
                    size="large"
                    className="w-full"
                  >
                    Explore Creators
                  </InteractiveButton>
                </div>
              </div>
              
              <div className="text-center">
                <InteractiveButton
                  onClick={handleSignIn}
                  variant="ghost"
                  size="medium"
                >
                  Already have an account? Sign In
                </InteractiveButton>
              </div>
            </div>
          )}
        </div>

        {/* Creator Showcase */}
        <CreatorShowcase />

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="feature-card text-center group">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Matching</h3>
            <p className="text-white/80">Advanced algorithm connecting creators with their ideal audience</p>
          </div>

          <div className="feature-card text-center group">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Creator Economy</h3>
            <p className="text-white/80">Monetize your content with subscriptions, tips, and exclusive access</p>
          </div>

          <div className="feature-card text-center group">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Safe & Secure</h3>
            <p className="text-white/80">Verified profiles and secure payments for peace of mind</p>
          </div>

          <div className="feature-card text-center group">
            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant Connect</h3>
            <p className="text-white/80">Real-time messaging and live interactions with your favorite creators</p>
          </div>
        </div>

        {/* Success Stories */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold text-white mb-12 font-playfair">Creator Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="testimonial-card bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mx-auto mb-4"></div>
                <h4 className="text-lg font-semibold text-white">Kemi A.</h4>
                <p className="text-white/70 text-sm">Lagos Creator</p>
              </div>
              <p className="text-white/90 italic">"I've earned over ₦2M in my first 6 months. Hooks changed my life!"</p>
            </div>
            
            <div className="testimonial-card bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mx-auto mb-4"></div>
                <h4 className="text-lg font-semibold text-white">Chioma B.</h4>
                <p className="text-white/70 text-sm">Abuja Influencer</p>
              </div>
              <p className="text-white/90 italic">"The community here is amazing. Real connections, real support."</p>
            </div>
            
            <div className="testimonial-card bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full mx-auto mb-4"></div>
                <h4 className="text-lg font-semibold text-white">Adunni C.</h4>
                <p className="text-white/70 text-sm">Port Harcourt Creator</p>
              </div>
              <p className="text-white/90 italic">"Finally, a platform that celebrates and empowers Black creators!"</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20">
          <h2 className="text-4xl font-bold text-white mb-6 font-playfair">Ready to Join the Movement?</h2>
          <p className="text-xl text-white/90 mb-8">Be part of Nigeria's premier creator economy platform</p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <InteractiveButton
                onClick={() => handleGetStarted('creator')}
                variant="primary"
                size="hero"
              >
                Start as Creator
              </InteractiveButton>
              <InteractiveButton
                onClick={() => handleGetStarted('consumer')}
                variant="outline"
                size="hero"
              >
                Join as Fan
              </InteractiveButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
