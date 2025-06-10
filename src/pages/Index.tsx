
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Wallet, Settings, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import AuthPage from "@/components/AuthPage";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";
import ExclusiveContentPage from "@/components/ExclusiveContentPage";
import WalletModal from "@/components/WalletModal";
import TipModal from "@/components/TipModal";
import ProfileButton from "@/components/ProfileButton";

// Sample creator data - would come from database in real app
const sampleCreators = [
  {
    id: "1",
    name: "Amara Beauty",
    age: 24,
    location: "Lagos, Nigeria",
    bio: "Fashion model and lifestyle content creator",
    images: ["/placeholder.svg"],
    isVerified: true,
    subscriptionFee: 5000,
    interests: ["Fashion", "Beauty", "Photography"]
  },
  {
    id: "2", 
    name: "Kemi Fitness",
    age: 26,
    location: "Abuja, Nigeria",
    bio: "Fitness coach and wellness enthusiast",
    images: ["/placeholder.svg"],
    isVerified: true,
    subscriptionFee: 3000,
    interests: ["Fitness", "Health", "Motivation"]
  }
];

type ViewType = 'home' | 'exclusive' | 'profile-setup';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { wallet } = useWallet();
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [showWallet, setShowWallet] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<{ id: string; name: string } | null>(null);

  // Handle navigation based on auth and profile state
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        // User not authenticated - AuthPage will handle this
        return;
      }
      
      if (user && !profile) {
        // User authenticated but no profile - show setup
        setCurrentView('profile-setup');
      } else if (user && profile) {
        // User authenticated with profile - show home
        setCurrentView('home');
      }
    }
  }, [user, profile, authLoading, profileLoading]);

  const handleProfileSetupComplete = () => {
    setCurrentView('home');
  };

  const handleSendTip = (creatorId: string, creatorName: string) => {
    setSelectedCreator({ id: creatorId, name: creatorName });
    setShowTipModal(true);
  };

  // Show loading while checking auth/profile state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show auth page if no user
  if (!user) {
    return <AuthPage />;
  }

  // Show profile setup if user exists but no profile
  if (currentView === 'profile-setup') {
    return <EnhancedProfileSetup onComplete={handleProfileSetupComplete} />;
  }

  // Show exclusive content page
  if (currentView === 'exclusive') {
    return <ExclusiveContentPage onBack={() => setCurrentView('home')} />;
  }

  // Main homepage for authenticated users with profiles
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪝</span>
              <h1 className="text-xl font-bold text-gradient">Hooks</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Wallet */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWallet(true)}
                className="flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>{wallet?.keys_balance || 0} 🪝</span>
              </Button>
              
              {/* Profile */}
              <ProfileButton />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Button
              variant="ghost"
              className={`py-4 px-0 rounded-none border-b-2 ${
                currentView === 'home' ? 'border-hooks-coral text-hooks-coral' : 'border-transparent'
              }`}
              onClick={() => setCurrentView('home')}
            >
              Discover
            </Button>
            <Button
              variant="ghost"
              className={`py-4 px-0 rounded-none border-b-2 ${
                currentView === 'exclusive' ? 'border-hooks-coral text-hooks-coral' : 'border-transparent'
              }`}
              onClick={() => setCurrentView('exclusive')}
            >
              Exclusive Content
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCreators.map((creator) => (
            <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={creator.images[0]}
                  alt={creator.name}
                  className="w-full h-64 object-cover"
                />
                {creator.isVerified && (
                  <Badge className="absolute top-2 right-2 bg-blue-500 text-white">
                    ✓ Verified
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{creator.name}</h3>
                  <span className="text-sm text-gray-500">{creator.age}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{creator.location}</p>
                <p className="text-sm text-gray-700 mb-3">{creator.bio}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {creator.interests.map((interest, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-semibold text-hooks-coral">
                      ₦{creator.subscriptionFee.toLocaleString()}/month
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-hooks-coral"
                      onClick={() => handleSendTip(creator.id, creator.name)}
                    >
                      Send Keys 🪝
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showWallet && (
        <WalletModal 
          isOpen={showWallet} 
          onClose={() => setShowWallet(false)} 
        />
      )}

      {showTipModal && selectedCreator && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => {
            setShowTipModal(false);
            setSelectedCreator(null);
          }}
          recipientName={selectedCreator.name}
          recipientId={selectedCreator.id}
        />
      )}
    </div>
  );
};

export default Index;
