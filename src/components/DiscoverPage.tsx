import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Wallet, Filter, Settings, RefreshCw, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { useDiscoverUsers } from "@/hooks/useDiscoverUsers";
import { useLikes } from "@/hooks/useLikes";
import { useMatches } from "@/hooks/useMatches";
import { useIncomingLikes } from "@/hooks/useIncomingLikes";
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
import IncomingLikesPage from "@/components/IncomingLikesPage";
import { useToast } from "@/hooks/use-toast";
import HookLogo from "@/components/HookLogo";

type ViewType = 'landing' | 'discover' | 'exclusive' | 'profile-setup' | 'messages' | 'incoming-likes';

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
  const { users: realUsers, loading: usersLoading, error: usersError, refetch } = useDiscoverUsers();
  const { createLike, checkMutualLike, checkExistingMatch, loading: likesLoading } = useLikes();
  const { matches: realMatches, refetch: refetchMatches } = useMatches();
  const { count: incomingLikesCount } = useIncomingLikes();
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
  const [filteredUsers, setFilteredUsers] = useState(realUsers);
  const [undoStack, setUndoStack] = useState<number[]>([]);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(3);
  
  // Stats state
  const [todaySwipes, setTodaySwipes] = useState(0);
  const [todayMatches, setTodayMatches] = useState(0);
  const [streakDays, setStreakDays] = useState(1);
  
  // Updated filters to include user type
  const [filters, setFilters] = useState({
    distance: 50,
    ageRange: [18, 35] as [number, number],
    gender: 'both',
    location: '',
    userType: 'both' // New filter for user type
  });

  // Apply filters to users - updated to handle both creators and consumers
  useEffect(() => {
    if (realUsers.length === 0) {
      setFilteredUsers([]);
      return;
    }

    let filtered = realUsers.filter(user => {
      // Gender filter
      if (filters.gender !== 'both' && user.gender !== filters.gender) {
        return false;
      }
      
      // Location filter - improved to handle state and city filtering
      if (filters.location) {
        const userLocation = user.location?.toLowerCase() || '';
        const filterLocation = filters.location.toLowerCase();
        
        // Check if user location contains the filter location
        if (!userLocation.includes(filterLocation)) {
          return false;
        }
      }
      
      // Age filter
      if (user.age < filters.ageRange[0] || user.age > filters.ageRange[1]) {
        return false;
      }
      
      // User type filter
      if (filters.userType !== 'both' && user.user_type !== filters.userType) {
        return false;
      }
      
      return true;
    });
    
    // Add some randomization to make discovery feel fresh
    filtered = filtered.sort(() => Math.random() - 0.5);
    
    setFilteredUsers(filtered);
    setCurrentUserIndex(0);
  }, [filters, realUsers]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentUser = filteredUsers[currentUserIndex];
    if (!currentUser) return;

    console.log(`🎯 Starting swipe ${direction} on user:`, currentUser.name, 'user_id:', currentUser.user_id);

    // Add current index to undo stack
    setUndoStack(prev => [...prev, currentUserIndex].slice(-5));
    
    // Update stats
    setTodaySwipes(prev => prev + 1);
    
    if (direction === 'right') {
      try {
        console.log('💕 Processing like for user:', currentUser.user_id);
        
        // Check if we already have a match first
        const hasExistingMatch = await checkExistingMatch(currentUser.user_id);
        if (hasExistingMatch) {
          console.log('ℹ️ Already matched with this user');
          toast({
            title: "Already Matched! 🎉",
            description: `You already have a match with ${currentUser.name}! Check your messages.`,
          });
          // Still move to next user
          if (currentUserIndex < filteredUsers.length - 1) {
            setCurrentUserIndex(prev => prev + 1);
          } else {
            setCurrentUserIndex(0);
          }
          return;
        }
        
        const success = await createLike(currentUser.user_id, false);
        
        if (success) {
          console.log('✅ Like created successfully, checking for mutual like...');
          
          // Add small delay to ensure database trigger has time to process
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check if this creates a match
          const isMatch = await checkMutualLike(currentUser.user_id);
          
          if (isMatch) {
            console.log('🎉 MUTUAL MATCH DETECTED!', currentUser.name);
            
            // Wait a bit more for match creation to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Refresh matches to get the latest from database
            console.log('🔄 Refreshing matches from database...');
            await refetchMatches();
            
            // Show match modal
            setCurrentMatch(currentUser);
            setShowMatchModal(true);
            setTodayMatches(prev => prev + 1);
            
            // Add to local matches for immediate UI update
            onMatchAdded(currentUser);
            
            toast({
              title: "It's a Match! 🎉",
              description: `You matched with ${currentUser.name}!`,
            });
          } else {
            console.log('💌 Like sent, but no mutual match yet');
            toast({
              title: "Like Sent! 💕",
              description: `Your like has been sent to ${currentUser.name}`,
            });
          }
        } else {
          console.log('❌ Failed to create like, not moving to next user');
          return; // Don't move to next user if like failed
        }
      } catch (error) {
        console.error('💥 Error in handleSwipe:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
        return; // Don't move to next user if error occurred
      }
    }
    
    // Move to next user only if everything succeeded (or it was a left swipe)
    if (currentUserIndex < filteredUsers.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      // Reset to first user when we've gone through all
      setCurrentUserIndex(0);
    }
  };

  const handleSuperLike = async () => {
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

    console.log('⚡ Super liking user:', currentUser.name, 'user_id:', currentUser.user_id);

    try {
      // Check if we already have a match first
      const hasExistingMatch = await checkExistingMatch(currentUser.user_id);
      if (hasExistingMatch) {
        console.log('ℹ️ Already matched with this user');
        toast({
          title: "Already Matched! 🎉",
          description: `You already have a match with ${currentUser.name}! Check your messages.`,
        });
        // Still move to next user and consume super like
        setSuperLikesRemaining(prev => prev - 1);
        if (currentUserIndex < filteredUsers.length - 1) {
          setCurrentUserIndex(prev => prev + 1);
        } else {
          setCurrentUserIndex(0);
        }
        return;
      }

      const success = await createLike(currentUser.user_id, true); // true for super like
      
      if (success) {
        setSuperLikesRemaining(prev => prev - 1);
        setUndoStack(prev => [...prev, currentUserIndex].slice(-5));
        setTodaySwipes(prev => prev + 1);
        
        console.log('✅ Super like created successfully, checking for match...');
        
        // Add delay for database processing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check for mutual match
        const isMatch = await checkMutualLike(currentUser.user_id);
        
        if (isMatch) {
          console.log('🎉 SUPER LIKE CREATED A MATCH!', currentUser.name);
          
          // Wait for match creation to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Refresh matches
          console.log('🔄 Refreshing matches after super like match...');
          await refetchMatches();
          
          setCurrentMatch(currentUser);
          setShowMatchModal(true);
          setTodayMatches(prev => prev + 1);
          onMatchAdded(currentUser);
          
          toast({
            title: "Super Match! ⚡",
            description: `Your super like matched with ${currentUser.name}!`,
          });
        } else {
          toast({
            title: "Super Like Sent! ⚡",
            description: `${currentUser.name} will know you super liked them!`,
          });
        }

        // Move to next user
        if (currentUserIndex < filteredUsers.length - 1) {
          setCurrentUserIndex(prev => prev + 1);
        } else {
          setCurrentUserIndex(0);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to send super like. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('💥 Error in handleSuperLike:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
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
    // Refetch users from database and shuffle
    refetch();
    
    toast({
      title: "Profiles Refreshed",
      description: "Loading new profiles from the platform!",
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

  const handleStartChatting = async () => {
    console.log('💬 Starting chat, ensuring matches are up to date...');
    
    try {
      // Refresh matches before navigating to ensure latest data
      await refetchMatches();
      console.log('✅ Matches refreshed, navigating to messages...');
      
      setShowMatchModal(false);
      setCurrentMatch(null);
      setCurrentView('messages');
    } catch (error) {
      console.error('❌ Error refreshing matches before chat:', error);
      // Still navigate even if refresh fails
      setShowMatchModal(false);
      setCurrentMatch(null);
      setCurrentView('messages');
    }
  };

  const handleFiltersApply = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    
    toast({
      title: "Filters Applied",
      description: "Updated your discovery preferences",
    });
  };

  // Show loading while fetching users
  if (usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  // Show error if failed to load users
  if (usersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-xl mb-4">Failed to load users</div>
          <Button onClick={refetch} className="bg-white text-hooks-coral hover:bg-white/90">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show incoming likes page if that's the current view
  if (currentView === 'incoming-likes') {
    return (
      <IncomingLikesPage 
        onBack={() => setCurrentView('discover')} 
      />
    );
  }

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

              {/* Incoming Likes */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('incoming-likes')}
                className="text-white hover:bg-white/20 relative"
              >
                <Heart className="w-5 h-5" />
                {incomingLikesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {incomingLikesCount}
                  </span>
                )}
              </Button>
              
              {/* Messages */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('messages')}
                className="text-white hover:bg-white/20 relative"
              >
                <MessageCircle className="w-5 h-5" />
                {realMatches.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {realMatches.length}
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
            totalMatches={realMatches.length}
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
                  <h3 className="text-xl font-semibold mb-2">
                    {realUsers.length === 0 ? "No users found!" : "You've seen everyone!"}
                  </h3>
                  <p className="mb-4">
                    {realUsers.length === 0 
                      ? "Be the first to create your profile and invite friends to join!"
                      : "Try adjusting your filters or check back later for new profiles."
                    }
                  </p>
                  <Button onClick={handleRefreshProfiles} className="gradient-coral">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {realUsers.length === 0 ? "Check for Users" : "Refresh Profiles"}
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
            disabled={currentUserIndex >= filteredUsers.length || likesLoading}
          />

          {/* Discovery Counter - Updated to show real match count */}
          <div className="text-center mt-6">
            <p className="text-white text-sm">
              {realMatches.length} matches • {Math.max(0, filteredUsers.length - currentUserIndex)} profiles remaining
            </p>
            {superLikesRemaining > 0 && (
              <p className="text-white/80 text-xs mt-1">
                {superLikesRemaining} Super Likes remaining today
              </p>
            )}
            <p className="text-white/60 text-xs mt-1">
              Showing {realUsers.length} real users • Use filters to customize
            </p>
            {incomingLikesCount > 0 && (
              <p className="text-white/80 text-xs mt-1">
                {incomingLikesCount} people liked you! 
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setCurrentView('incoming-likes')}
                  className="text-white underline p-0 ml-1 h-auto"
                >
                  View likes
                </Button>
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
