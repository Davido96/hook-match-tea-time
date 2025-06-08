
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MessageCircle, Settings, Star, Zap } from "lucide-react";
import SwipeCard from "@/components/SwipeCard";
import ChatInterface from "@/components/ChatInterface";
import ProfileSetup from "@/components/ProfileSetup";

// Sample user data
const sampleUsers = [
  {
    id: 1,
    name: "Alex",
    age: 24,
    bio: "Adventure seeker, coffee lover ☕",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    interests: ["Travel", "Coffee", "Hiking"],
    distance: "2 miles away"
  },
  {
    id: 2,
    name: "Sam",
    age: 27,
    bio: "Artist by day, chef by night 🎨👨‍🍳",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c5c0?w=400&h=600&fit=crop",
    interests: ["Art", "Cooking", "Music"],
    distance: "5 miles away"
  },
  {
    id: 3,
    name: "Jordan",
    age: 23,
    bio: "Fitness enthusiast & dog parent 🐕",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop",
    interests: ["Fitness", "Dogs", "Running"],
    distance: "1 mile away"
  }
];

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'setup' | 'swipe' | 'chat'>('landing');
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [showMatch, setShowMatch] = useState(false);

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

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
        <div className="container mx-auto px-4 py-8 text-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🪝</span>
              <h1 className="text-2xl font-bold">Hooks</h1>
            </div>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-hooks-coral">
              Sign In
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-float">
              Find Your
              <br />
              <span className="text-gradient">Perfect Match</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Swipe, Match, Chat. The most authentic way to meet people around you.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-hooks-coral hover:bg-white/90 text-lg px-8 py-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={() => setCurrentView('setup')}
            >
              Start Matching 🪝 🍵
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-hooks-coral" />
                <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
                <p className="text-white/80">Our algorithm learns your preferences to find perfect matches</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-hooks-blue" />
                <h3 className="text-xl font-semibold mb-2">Instant Chat</h3>
                <p className="text-white/80">Start meaningful conversations with your matches instantly</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
                <p className="text-white/80">Real people, real connections, verified authenticity</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="text-center">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold">10M+</div>
                <div className="text-white/80">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold">2M+</div>
                <div className="text-white/80">Matches Daily</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-white/80">Success Stories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'setup') {
    return <ProfileSetup onComplete={() => setCurrentView('swipe')} />;
  }

  if (currentView === 'chat') {
    return <ChatInterface onBack={() => setCurrentView('swipe')} matches={matches} />;
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
            </div>
            <div className="flex items-center space-x-4">
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
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Swipe Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
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
              className="rounded-full w-16 h-16 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
            >
              <Zap className="w-6 h-6 text-blue-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Match Celebration Modal */}
      {showMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center animate-match-celebration">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gradient mb-2">It's a Match!</h2>
            <p className="text-gray-600">You and {sampleUsers[currentUserIndex]?.name} liked each other</p>
            <Button 
              className="mt-4 gradient-coral text-white"
              onClick={() => setCurrentView('chat')}
            >
              Start Chatting
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
