
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Wallet, X, User, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import AuthPage from "@/components/AuthPage";
import EnhancedProfileSetup from "@/components/EnhancedProfileSetup";
import ExclusiveContentPage from "@/components/ExclusiveContentPage";
import WalletModal from "@/components/WalletModal";
import TipModal from "@/components/TipModal";
import ProfileButton from "@/components/ProfileButton";
import ProfileViewModal from "@/components/ProfileViewModal";
import SwipeCard from "@/components/SwipeCard";
import ChatInterface from "@/components/ChatInterface";
import EditProfileModal from "@/components/EditProfileModal";
import MatchModal from "@/components/MatchModal";
import FilterModal from "@/components/FilterModal";
import LandingPage from "@/components/LandingPage";

// Sample users for matching
const sampleUsers = [
  {
    id: 1,
    name: "Amara Beauty",
    age: 24,
    bio: "Fashion model and lifestyle content creator passionate about beauty and photography",
    image: "/placeholder.svg",
    interests: ["Fashion", "Beauty", "Photography", "Travel"],
    distance: "2 km away",
    isVerified: true,
    subscriptionFee: 5000,
    location: "Lagos, Nigeria",
    gender: "female",
    user_type: "creator"
  },
  {
    id: 2,
    name: "Kemi Fitness",
    age: 26,
    bio: "Fitness coach and wellness enthusiast helping people live their best lives",
    image: "/placeholder.svg",
    interests: ["Fitness", "Health", "Motivation", "Nutrition"],
    distance: "5 km away",
    isVerified: true,
    subscriptionFee: 3000,
    location: "Abuja, Nigeria",
    gender: "female",
    user_type: "creator"
  },
  {
    id: 3,
    name: "Tunde Creative",
    age: 28,
    bio: "Digital artist and content creator specializing in African art and culture",
    image: "/placeholder.svg",
    interests: ["Art", "Design", "Culture", "Music"],
    distance: "3 km away",
    isVerified: true,
    subscriptionFee: 4000,
    location: "Ibadan, Nigeria",
    gender: "male",
    user_type: "creator"
  }
];

type ViewType = 'landing' | 'discover' | 'exclusive' | 'profile-setup' | 'messages';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { wallet } = useWallet();
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [showWallet, setShowWallet] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<{ id: string; name: string } | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [filteredUsers, setFilteredUsers] = useState(sampleUsers);
  const [filters, setFilters] = useState({
    distance: 50,
    ageRange: [18, 35],
    gender: 'both',
    location: ''
  });

  // Handle navigation based on auth and profile state
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        setCurrentView('landing');
        return;
      }
      
      if (user && !profile) {
        setCurrentView('profile-setup');
      } else if (user && profile && currentView === 'landing') {
        setCurrentView('discover');
      }
    }
  }, [user, profile, authLoading, profileLoading, currentView]);

  // Apply filters to users
  useEffect(() => {
    let filtered = sampleUsers.filter(user => {
      // Gender filter
      if (filters.gender !== 'both' && user.gender !== filters.gender) {
        return false;
      }
      
      // Location filter
      if (filters.location && !user.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Age filter
      if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) {
        return false;
      }
      
      return true;
    });
    
    setFilteredUsers(filtered);
    setCurrentUserIndex(0);
  }, [filters]);

  const handleProfileSetupComplete = () => {
    setCurrentView('discover');
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // It's a match! Add to matches
      const currentUser = filteredUsers[currentUserIndex];
      if (currentUser) {
        setMatches(prev => [...prev, currentUser]);
        setCurrentMatch(currentUser);
        setShowMatchModal(true);
        console.log(`Matched with ${currentUser.name}!`);
      }
    }
    
    // Move to next user
    if (currentUserIndex < filteredUsers.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      // Reset to first user when we've gone through all
      setCurrentUserIndex(0);
    }
  };

  const handleSendTip = (creatorId: string, creatorName: string) => {
    setSelectedCreator({ id: creatorId, name: creatorName });
    setShowTipModal(true);
  };

  const handleViewProfile = (creator: any) => {
    setSelectedProfile(creator);
    setShowProfileView(true);
  };

  const handleMatchModalClose = () => {
    setShowMatchModal(false);
    setCurrentMatch(null);
  };

  const handleStartChatting = () => {
    setShowMatchModal(false);
    setCurrentMatch(null);
    setCurrentView('messages');
  };

  const handleFiltersApply = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  // Show loading while checking auth/profile state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show landing page if no user
  if (!user || currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('discover')} />;
  }

  // Show profile setup if user exists but no profile
  if (currentView === 'profile-setup') {
    return <EnhancedProfileSetup onComplete={handleProfileSetupComplete} />;
  }

  // Show exclusive content page
  if (currentView === 'exclusive') {
    return <ExclusiveContentPage onBack={() => setCurrentView('discover')} />;
  }

  // Show messages interface
  if (currentView === 'messages') {
    return <ChatInterface onBack={() => setCurrentView('discover')} matches={matches} />;
  }

  // Main discover interface with Tinder-style cards
  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪝</span>
              <h1 className="text-xl font-bold text-white">Hooks</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filter */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterModal(true)}
                className="text-white hover:bg-white/20"
              >
                <Filter className="w-5 h-5" />
              </Button>
              
              {/* Messages */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('messages')}
                className="text-white hover:bg-white/20 relative"
              >
                <MessageCircle className="w-5 h-5" />
                {matches.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {matches.length}
                  </span>
                )}
              </Button>
              
              {/* Wallet */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWallet(true)}
                className="flex items-center space-x-2 text-white hover:bg-white/20"
              >
                <Wallet className="w-4 h-4" />
                <span>{wallet?.keys_balance || 0} 🪝</span>
              </Button>
              
              {/* Profile */}
              <ProfileButton onEditProfile={() => setShowEditProfile(true)} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <Button
              variant="ghost"
              className={`py-4 px-0 rounded-none border-b-2 text-white hover:bg-white/20 ${
                currentView === 'discover' ? 'border-white' : 'border-transparent'
              }`}
              onClick={() => setCurrentView('discover')}
            >
              Discover
            </Button>
            <Button
              variant="ghost"
              className={`py-4 px-0 rounded-none border-b-2 text-white hover:bg-white/20 ${
                currentView === 'exclusive' ? 'border-white' : 'border-transparent'
              }`}
              onClick={() => setCurrentView('exclusive')}
            >
              Exclusive Content
            </Button>
          </div>
        </div>
      </div>

      {/* Main Swipe Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-sm mx-auto">
          {/* Card Stack */}
          <div className="relative h-[600px] mb-8">
            {filteredUsers.length > 0 && currentUserIndex < filteredUsers.length ? (
              <SwipeCard
                user={filteredUsers[currentUserIndex]}
                onSwipe={handleSwipe}
              />
            ) : (
              <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-hooks-coral" />
                  <h3 className="text-xl font-semibold mb-2">No more profiles</h3>
                  <p>Try adjusting your filters or check back later!</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-6">
            <Button
              size="lg"
              variant="outline"
              className="w-16 h-16 rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => handleSwipe('left')}
              disabled={currentUserIndex >= filteredUsers.length}
            >
              <X className="w-8 h-8" />
            </Button>
            
            <Button
              size="lg"
              className="w-20 h-20 rounded-full bg-white text-hooks-coral hover:bg-gray-100"
              onClick={() => filteredUsers[currentUserIndex] && handleViewProfile(filteredUsers[currentUserIndex])}
              disabled={currentUserIndex >= filteredUsers.length}
            >
              <User className="w-8 h-8" />
            </Button>
            
            <Button
              size="lg"
              className="w-16 h-16 rounded-full gradient-coral"
              onClick={() => handleSwipe('right')}
              disabled={currentUserIndex >= filteredUsers.length}
            >
              <Heart className="w-8 h-8" />
            </Button>
          </div>

          {/* Match Counter */}
          <div className="text-center mt-6">
            <p className="text-white text-sm">
              {matches.length} matches • {filteredUsers.length - currentUserIndex} profiles remaining
            </p>
          </div>
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

      {showProfileView && selectedProfile && (
        <ProfileViewModal
          isOpen={showProfileView}
          onClose={() => {
            setShowProfileView(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
        />
      )}

      {showEditProfile && (
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {showMatchModal && currentMatch && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={handleMatchModalClose}
          match={currentMatch}
          onStartChatting={handleStartChatting}
        />
      )}

      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={filters}
          onApply={handleFiltersApply}
        />
      )}
    </div>
  );
};

export default Index;
