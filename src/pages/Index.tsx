import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MessageCircle, Settings, Star, Zap, Shield, Camera, Wallet, Grid3X3 } from "lucide-react";
import SwipeCard from "@/components/SwipeCard";
import ChatInterface from "@/components/ChatInterface";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";
import ExclusiveContentPage from "@/components/ExclusiveContentPage";
import ProfileButton from "@/components/ProfileButton";
import WalletModal from "@/components/WalletModal";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { useNavigate } from "react-router-dom";

// Sample user data with Nigerian context
const sampleUsers = [
  {
    id: 1,
    name: "Amara",
    age: 24,
    bio: "Lagos-based content creator ✨ Fashion & lifestyle",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c5c0?w=400&h=600&fit=crop",
    interests: ["Fashion", "Photography", "Lagos"],
    distance: "2km away in Victoria Island"
  },
  {
    id: 2,
    name: "Kemi",
    age: 27,
    bio: "Abuja entrepreneur 💼 Exclusive content creator",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    interests: ["Business", "Lifestyle", "Travel"],
    distance: "5km away in Maitama"
  },
  {
    id: 3,
    name: "Tunde",
    age: 23,
    bio: "Fitness coach & model 💪 Premium content",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop",
    interests: ["Fitness", "Modeling", "Health"],
    distance: "1km away in Lekki"
  }
];

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { wallet } = useWallet();
  const navigate = useNavigate();
  
  const [currentView, setCurrentView] = useState<'landing' | 'setup' | 'swipe' | 'chat' | 'exclusive'>('landing');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (!profile && !profileLoading) {
        setCurrentView('setup');
      } else if (profile) {
        setCurrentView('swipe');
      }
    } else if (!authLoading && !user) {
      setCurrentView('landing');
    }
  }, [user, profile, authLoading, profileLoading]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Simulate match (50% chance)
      if (Math.random() > 0.5) {
        const newMatch = sampleUsers[currentUserIndex];
        setMatches([...matches, newMatch]);
        setShowMatch(true);
        setTimeout(() => setShowMatch(false), 3000);
      }
    }
    
    setTimeout(() => {
      setCurrentUserIndex((prev) => (prev + 1) % sampleUsers.length);
    }, 300);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user && currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
        <div className="container mx-auto px-4 py-8 text-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🪝</span>
              <h1 className="text-2xl font-bold">Hooks</h1>
            </div>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-hooks-coral"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-float">
              Nigeria's
              <br />
              <span className="text-gradient">Premium Network</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Connect with exclusive content creators. Subscribe, tip with Keys (₦), and discover premium experiences across Nigeria.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-hooks-coral hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate('/auth')}
            >
              Join Premium Network 🪝
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-hooks-coral" />
                <h3 className="text-xl font-semibold mb-2">Exclusive Content</h3>
                <p className="text-white/80">Premium photos and videos from verified Nigerian creators</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-hooks-blue" />
                <h3 className="text-xl font-semibold mb-2">Keys Currency</h3>
                <p className="text-white/80">Purchase Keys (₦1,000 each) to tip creators and unlock premium features</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-xl font-semibold mb-2">Safe & Verified</h3>
                <p className="text-white/80">Age-verified profiles with secure Nigerian payment methods</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="text-center">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-white/80">Active Nigerians</div>
              </div>
              <div>
                <div className="text-3xl font-bold">₦10M+</div>
                <div className="text-white/80">Creator Earnings</div>
              </div>
              <div>
                <div className="text-3xl font-bold">Lagos</div>
                <div className="text-white/80">to Abuja</div>
              </div>
            </div>
          </div>

          {/* Nigerian Payment Methods */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">Secure Nigerian Payments</h3>
            <div className="flex justify-center space-x-8 opacity-80">
              <div className="bg-white/20 px-6 py-3 rounded-lg">Paystack</div>
              <div className="bg-white/20 px-6 py-3 rounded-lg">Bank Transfer</div>
              <div className="bg-white/20 px-6 py-3 rounded-lg">Flutterwave</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'setup') {
    return <EnhancedProfileSetup onComplete={() => setCurrentView('swipe')} />;
  }

  if (currentView === 'chat') {
    return <ChatInterface onBack={() => setCurrentView('swipe')} matches={matches} />;
  }

  if (currentView === 'exclusive') {
    return <ExclusiveContentPage onBack={() => setCurrentView('swipe')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪝</span>
              <h1 className="text-xl font-bold text-gradient">Hooks</h1>
              <Badge className="bg-hooks-coral text-white text-xs">PREMIUM</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-hooks-coral"
                onClick={() => setShowWalletModal(true)}
              >
                <Wallet className="w-4 h-4 mr-1" />
                {wallet?.keys_balance || 0} Keys
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('exclusive')}
                className="text-hooks-coral"
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Exclusive
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView('chat')}
                className="relative"
              >
                <MessageCircle className="w-5 h-5" />
                {matches.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-hooks-coral text-white text-xs px-1.5">
                    {matches.length}
                  </Badge>
                )}
              </Button>
              <ProfileButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Swipe Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Keys Notice */}
          <div className="mb-6 text-center">
            <Card className="bg-gradient-to-r from-hooks-coral to-hooks-pink text-white">
              <CardContent className="p-4">
                <p className="text-sm">💡 Purchase Keys (₦1,000 each) to tip creators and unlock premium features</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 border-white text-white hover:bg-white hover:text-hooks-coral"
                  onClick={() => setShowWalletModal(true)}
                >
                  Buy Keys
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Swipe Cards */}
          <div className="relative h-[600px] mb-8">
            {currentUserIndex < sampleUsers.length && (
              <SwipeCard 
                user={sampleUsers[currentUserIndex]} 
                onSwipe={handleSwipe}
              />
            )}
            
            {currentUserIndex + 1 < sampleUsers.length && (
              <div className="absolute inset-0 -z-10 scale-95 opacity-50">
                <SwipeCard 
                  user={sampleUsers[currentUserIndex + 1]} 
                  onSwipe={() => {}}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 border-2 border-red-200 hover:border-red-300 hover:bg-red-50"
              onClick={() => handleSwipe('left')}
            >
              <X className="w-6 h-6 text-red-500" />
            </Button>
            
            <Button
              size="lg"
              className="rounded-full w-20 h-20 gradient-coral hover:scale-105 transition-transform"
              onClick={() => handleSwipe('right')}
            >
              <Heart className="w-8 h-8 text-white" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 border-2 border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50"
              title="Send 1 Key Tip"
            >
              <span className="text-xl">🪝</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Match Celebration Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-match-celebration">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gradient mb-2">Premium Match!</h2>
            <p className="text-gray-600">You and {sampleUsers[currentUserIndex]?.name} are now connected</p>
            <Button 
              className="mt-4 gradient-coral text-white"
              onClick={() => setCurrentView('chat')}
            >
              Start Premium Chat
            </Button>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && (
        <WalletModal 
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
        />
      )}
    </div>
  );
};

export default Index;
