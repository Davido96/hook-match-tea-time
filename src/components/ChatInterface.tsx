import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Heart, MessageCircle, Smile, RefreshCw, Gift } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMatches } from "@/hooks/useMatches";
import { useMessages } from "@/hooks/useMessages";
import { useNavigate } from "react-router-dom";
import TipModal from "./TipModal";

interface ChatInterfaceProps {
  onBack: () => void;
}

const ChatInterface = ({ onBack }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const { matches, loading: matchesLoading, error: matchesError, refetch: refetchMatches, retryCount } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  
  const { messages, loading: messagesLoading, sendMessage } = useMessages(selectedMatch?.user_id);

  // Show retry button after 8 seconds of loading
  useEffect(() => {
    if (matchesLoading) {
      const timer = setTimeout(() => {
        setShowRetryButton(true);
      }, 8000);

      return () => {
        clearTimeout(timer);
        setShowRetryButton(false);
      };
    } else {
      setShowRetryButton(false);
    }
  }, [matchesLoading]);

  // Log matches for debugging
  useEffect(() => {
    console.log('💬 ChatInterface matches updated:', matches.length, 'matches found');
    if (matches.length > 0) {
      console.log('💬 First match:', matches[0]);
    }
  }, [matches]);

  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;
    
    console.log('💬 Sending message:', newMessage, 'to:', selectedMatch.name);
    
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAvatarClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleOpenTipModal = () => {
    setShowTipModal(true);
  };

  const getLastActiveText = (lastActive: string) => {
    const now = new Date();
    const active = new Date(lastActive);
    const diffHours = Math.floor((now.getTime() - active.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Active now";
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    return `Active ${Math.floor(diffHours / 24)}d ago`;
  };

  const handleRetry = () => {
    setShowRetryButton(false);
    refetchMatches();
  };

  // Loading state with skeleton and retry option
  if (matchesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold text-white">Messages</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center text-white space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xl">Loading your matches...</span>
              </div>
              
              {retryCount > 0 && (
                <p className="text-white/80 text-sm">
                  Retry attempt {retryCount}/3
                </p>
              )}

              {/* Skeleton loading */}
              <div className="space-y-3 mt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-white/10">
                    <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-white/20" />
                      <Skeleton className="h-3 w-24 bg-white/20" />
                    </div>
                  </div>
                ))}
              </div>

              {showRetryButton && (
                <Button 
                  onClick={handleRetry}
                  className="bg-white text-hooks-coral hover:bg-white/90 mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (matchesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-bold text-white">Messages</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-center text-white space-y-4">
              <h2 className="text-xl font-semibold">Unable to load matches</h2>
              <p className="text-white/80">{matchesError}</p>
              <div className="space-y-2">
                <Button 
                  onClick={handleRetry}
                  className="bg-white text-hooks-coral hover:bg-white/90"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={onBack}
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-white">Messages</h1>
            </div>
            
            {selectedMatch && (
              <div className="flex items-center space-x-3">
                <div className="text-white text-sm">
                  <span>{selectedMatch.name}</span>
                </div>
                <Button
                  onClick={handleOpenTipModal}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Send Tip
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {!selectedMatch ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matches List */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">Your Matches</h2>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {matches.length}
                  </Badge>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="Search matches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                </div>

                {/* Matches List */}
                <ScrollArea className="h-[500px]">
                  {filteredMatches.length > 0 ? (
                    <div className="space-y-3">
                      {filteredMatches.map((match) => (
                        <div
                          key={match.id}
                          onClick={() => setSelectedMatch(match)}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
                        >
                          <Avatar 
                            className="w-12 h-12 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAvatarClick(match.user_id);
                            }}
                          >
                            <AvatarImage src={match.image} alt={match.name} />
                            <AvatarFallback>{match.name[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-white text-sm truncate">
                                {match.name}
                              </h3>
                              <span className="text-white/60 text-xs">{match.age}</span>
                            </div>
                            <p className="text-white/80 text-xs truncate">
                              {getLastActiveText(match.last_active)}
                            </p>
                          </div>

                          <MessageCircle className="w-4 h-4 text-white/60" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/60 py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No matches yet</p>
                      <p className="text-sm">
                        {searchTerm ? "No matches found for your search." : "Start swiping to find your perfect match!"}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Empty Chat State */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 h-[600px] flex items-center justify-center">
                <div className="text-center text-white/60">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Select a match to start chatting</h3>
                  <p>Choose someone from your matches to begin a conversation</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Matches List (Mobile: Hidden, Desktop: Shown) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="font-semibold text-white text-sm mb-4">Matches</h3>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        onClick={() => setSelectedMatch(match)}
                        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedMatch?.id === match.id 
                            ? 'bg-white/20' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <Avatar 
                          className="w-8 h-8 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvatarClick(match.user_id);
                          }}
                        >
                          <AvatarImage src={match.image} alt={match.name} />
                          <AvatarFallback className="text-xs">{match.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-white text-xs truncate">{match.name}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMatch(null)}
                        className="lg:hidden text-white hover:bg-white/20 p-1"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      
                      <Avatar 
                        className="w-10 h-10 cursor-pointer"
                        onClick={() => handleAvatarClick(selectedMatch.user_id)}
                      >
                        <AvatarImage src={selectedMatch.image} alt={selectedMatch.name} />
                        <AvatarFallback>{selectedMatch.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-white">{selectedMatch.name}</h3>
                        <p className="text-white/60 text-sm">
                          {getLastActiveText(selectedMatch.last_active)}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleOpenTipModal}
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Send Tip
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="h-[400px] p-4">
                  {messagesLoading ? (
                    <div className="text-center text-white/60 py-8">
                      Loading messages...
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-2xl ${
                              message.sender === 'me'
                                ? 'bg-white text-hooks-coral'
                                : 'bg-white/20 text-white'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'me' ? 'text-hooks-coral/60' : 'text-white/60'
                            }`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white/60 py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Say hello!</p>
                      <p className="text-sm">Start the conversation with {selectedMatch.name}</p>
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-white/20">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={`Message ${selectedMatch.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-white text-hooks-coral hover:bg-white/90"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tip Modal */}
      {selectedMatch && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          recipientName={selectedMatch.name}
          recipientId={selectedMatch.user_id}
        />
      )}
    </div>
  );
};

export default ChatInterface;
