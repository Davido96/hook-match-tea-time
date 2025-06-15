import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Wallet, Filter, Settings, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import UnifiedWalletModal from "@/components/UnifiedWalletModal";
import TipModal from "@/components/TipModal";
import ProfileButton from "@/components/ProfileButton";
import ProfileViewModal from "@/components/ProfileViewModal";
import EnhancedSwipeCard from "@/components/EnhancedSwipeCard";
import CardStackPreview from "@/components/CardStackPreview";
import EnhancedActionBar from "@/components/EnhancedActionBar";
import DiscoveryStats from "@/components/DiscoveryStats";
import EditProfileModal from "@/components/EditProfileModal";
import MatchModal from "@/components/MatchModal";
import FilterModal from "@/components/FilterModal";
import { sampleUsers } from "@/data/sampleUsers";
import { useToast } from "@/hooks/use-toast";
import HookLogo from "@/components/HookLogo";

type ViewType = 'landing' | 'discover' | 'exclusive' | 'profile-setup' | 'messages';

interface DiscoverPageProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  matches: any[];
  onMatchAdded: (match: any) => void;
}

const DiscoverPage = ({ currentView, setCurrentView, matches, onMatchAdded }: DiscoverPageProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { wallet } = useWallet();
  const { toast } = useToast();
  
  // Modals state
  const [showWallet, setShowWallet] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showProfileView, setShowProfileView] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Selection state
  const [selectedCreator, setSelectedCreator] = useState<{ id: string; name: string } | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  
  // Discovery state
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState(sampleUsers);
  const [undoStack, setUndoStack] = useState<number[]>([]);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(3);
  
  // Stats state
  const [todaySwipes, setTodaySwipes] = useState(0);
  const [todayMatches, setTodayMatches] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  
  // Filters state
  const [filters, setFilters] = useState({
    distance: 50,
    ageRange: [18, 35] as [number, number],
    gender: 'both',
    location: ''
  });

  // Apply filters to users
  useEffect(() => {
    let filtered = sampleUsers.filter(user => {
      if (filters.gender !== 'both' && user.gender !== filters.gender) {
        return false;
      }
      
      if (filters.location && !user.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) {
        return false;
      }
      
      return true;
    });
    
    // Add some randomization to make discovery feel fresh
    filtered = filtered.sort(() => Math.random() - 0.5);
    
    setFilteredUsers(filtered);
    setCurrentUserIndex(0);
  }, [filters]);

  const handleSwipe = (direction: 'left' | 'right') => {
    const currentUser = filteredUsers[currentUserIndex];
    if (!currentUser) return;

    // Add current index to undo stack
    setUndoStack(prev => [...prev, currentUserIndex].slice(-5)); // Keep last 5 for undo
    
    // Update stats
    setTodaySwipes(prev => prev + 1);
    
    if (direction === 'right') {
      // It's a match! Add to matches
      onMatchAdded(currentUser);
      setCurrentMatch(currentUser);
      setShowMatchModal(true);
      setTodayMatches(prev => prev + 1);
      
      toast({
        title: "It's a Match! 🎉",
        description: `You matched with ${currentUser.name}!`,
      });
      
      console.log(`Matched with ${currentUser.name}!`);
    }
    
    // Move to next user
    if (currentUserIndex < filteredUsers.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      // Reset to first user when we've gone through all
      setCurrentUserIndex(0);
    }
  };

  const handleSuperLike = () => {
    if (superLikesRemaining <= 0) {
      toast({
        title: "No Super Likes Left",
        description: "You've used all your Super Likes for today. Get more with a premium subscription!",
        variant: "destructive"
      });
      return;
    }

    const currentUser = filteredUsers[currentUserIndex];
    if (!currentUser) return;

    setSuperLikesRemaining(prev => prev - 1);
    setUndoStack(prev => [...prev, currentUserIndex].slice(-5));
    setTodaySwipes(prev => prev + 1);
    
    // Super likes have higher match probability
    onMatchAdded(currentUser);
    setCurrentMatch(currentUser);
    setShowMatchModal(true);
    setTodayMatches(prev => prev + 1);
    
    toast({
      title: "Super Like Sent! ⚡",
      description: `${currentUser.name} will know you super liked them!`,
    });

    // Move to next user
    if (currentUserIndex < filteredUsers.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      setCurrentUserIndex(0);
    }
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    
    const lastIndex = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setCurrentUserIndex(lastIndex);
    setTodaySwipes(prev => Math.max(0, prev - 1));
    
    toast({
      title: "Undone",
      description: "Went back to previous profile",
    });
  };

  const handleViewProfile = () => {
    const currentUser = filteredUsers[currentUserIndex];
    if (currentUser) {
      setSelectedProfile(currentUser);
      setShowProfileView(true);
    }
  };

  const handleRefreshProfiles = () => {
    // Shuffle the filtered users to show new profiles
    const shuffled = [...filteredUsers].sort(() => Math.random() - 0.5);
    setFilteredUsers(shuffled);
    setCurrentUserIndex(0);
    
    toast({
      title: "Profiles Refreshed",
      description: "Showing new profiles in your area!",
    });
  };

  const handleSendTip = (creatorId: string, creatorName: string) => {
    setSelectedCreator({ id: creatorId, name: creatorName });
    setShowTipModal(true);
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
    
    toast({
      title: "Filters Applied",
      description: "Updated your discovery preferences",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HookLogo size="md" />
              <h1 className="text-xl font-bold text-white">Hooks</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Refresh */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshProfiles}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              
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
                <span>{wallet?.keys_balance || 0}</span>
                <HookLogo size="sm" />
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-sm mx-auto">
          {/* Discovery Stats */}
          <DiscoveryStats
            todaySwipes={todaySwipes}
            todayMatches={todayMatches}
            streakDays={streakDays}
            totalMatches={matches.length}
          />

          {/* Card Stack */}
          <div className="relative h-[600px] mb-8">
            {filteredUsers.length > 0 && currentUserIndex < filteredUsers.length ? (
              <>
                {/* Preview cards in background */}
                <CardStackPreview 
                  users={filteredUsers} 
                  currentIndex={currentUserIndex}
                />
                
                {/* Main card */}
                <EnhancedSwipeCard
                  user={filteredUsers[currentUserIndex]}
                  onSwipe={handleSwipe}
                  onSuperLike={handleSuperLike}
                  onViewProfile={handleViewProfile}
                  canUndo={undoStack.length > 0}
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center text-gray-500 p-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold mb-2">You've seen everyone!</h3>
                  <p className="mb-4">Try adjusting your filters or check back later for new profiles.</p>
                  <Button onClick={handleRefreshProfiles} className="gradient-coral">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Profiles
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <EnhancedActionBar
            onPass={() => handleSwipe('left')}
            onLike={() => handleSwipe('right')}
            onSuperLike={handleSuperLike}
            onViewProfile={handleViewProfile}
            onUndo={handleUndo}
            canUndo={undoStack.length > 0}
            superLikesRemaining={superLikesRemaining}
            disabled={currentUserIndex >= filteredUsers.length}
          />

          {/* Discovery Counter */}
          <div className="text-center mt-6">
            <p className="text-white text-sm">
              {matches.length} matches • {Math.max(0, filteredUsers.length - currentUserIndex)} profiles remaining
            </p>
            {superLikesRemaining > 0 && (
              <p className="text-white/80 text-xs mt-1">
                {superLikesRemaining} Super Likes remaining today
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showWallet && (
        <UnifiedWalletModal 
          isOpen={showWallet} 
          onClose={() => setShowWallet(false)} 
          defaultTab="purchase"
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

export default DiscoverPage;
