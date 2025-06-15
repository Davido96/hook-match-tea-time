
import { Button } from "@/components/ui/button";
import { Heart, Users, Shield, Zap } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage = ({ onGetStarted, onSignIn }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <span className="text-6xl">🪝</span>
            <h1 className="text-6xl font-bold text-white">Hooks</h1>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Connect. Create. Earn.
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            The premium dating and content platform where meaningful connections meet exclusive experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-white text-hooks-coral hover:bg-white/90 font-semibold px-8 py-4 text-lg"
            >
              Get Started
            </Button>
            <Button 
              onClick={onSignIn}
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Heart className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Smart Matching</h3>
            <p className="text-white/80">AI-powered algorithm finds your perfect connection</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Users className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Exclusive Content</h3>
            <p className="text-white/80">Access premium content from verified creators</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Shield className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Verified Profiles</h3>
            <p className="text-white/80">Connect with confidence through our verification system</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <Zap className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Instant Rewards</h3>
            <p className="text-white/80">Earn and tip with our integrated Keys currency</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to find your perfect match?
          </h3>
          <p className="text-white/90 mb-6 max-w-md mx-auto">
            Join thousands of users who have found meaningful connections and exclusive content on Hooks.
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-white text-hooks-coral hover:bg-white/90 font-semibold px-8 py-4"
          >
            Start Your Journey
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/20 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/70">
            <p>&copy; 2024 Hooks. All rights reserved.</p>
            <p className="mt-2">Where connections become experiences.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
