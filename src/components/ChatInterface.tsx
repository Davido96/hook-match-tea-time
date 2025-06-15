
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import HookLogo from "@/components/HookLogo";
import { useUserPresence } from "@/hooks/useUserPresence";

interface ChatInterfaceProps {
  onBack: () => void;
  matches: any[];
}

const ChatInterface = ({ onBack, matches }: ChatInterfaceProps) => {
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey! Thanks for the match 😊", sender: "them", time: "2:30 PM" },
    { id: 2, text: "Hi! Great to meet you! How's your day going?", sender: "me", time: "2:32 PM" },
    { id: 3, text: "It's going great! I love your hiking photos 🏔️", sender: "them", time: "2:35 PM" },
  ]);
  const { getUserStatus, userStatuses } = useUserPresence();
  const [matchStatus, setMatchStatus] = useState<string>("Online now");

  // Fetch status when a match is selected
  useEffect(() => {
    if (selectedMatch?.user_id) {
      getUserStatus(selectedMatch.user_id).then(status => {
        setMatchStatus(status.statusText);
      });
    }
  }, [selectedMatch, getUserStatus]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const handleProfileClick = (match: any) => {
    // Use user_id (UUID) for navigation, fallback to id if user_id is not available
    const profileId = match.user_id || match.id;
    console.log('Navigating to profile:', { 
      matchName: match.name, 
      user_id: match.user_id, 
      id: match.id, 
      navigatingTo: profileId 
    });
    navigate(`/profile/${profileId}`);
  };

  if (!selectedMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <HookLogo size="md" />
                <h1 className="text-xl font-bold text-gradient">Your Matches</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="container mx-auto px-4 py-8">
          {matches.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">No matches yet</h2>
              <p className="text-gray-500">Start swiping to find your perfect match!</p>
              <Button 
                className="mt-4 gradient-coral text-white"
                onClick={onBack}
              >
                Back to Swiping
              </Button>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-4">
              <h2 className="text-2xl font-bold text-center mb-6">Your Matches</h2>
              {matches.map((match) => {
                const status = userStatuses[match.user_id] || { statusText: "Loading..." };
                return (
                  <Card 
                    key={match.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProfileClick(match);
                          }}
                        >
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={match.image} alt={match.name} />
                            <AvatarFallback>{match.name[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <h3 
                            className="font-semibold text-lg cursor-pointer hover:text-hooks-coral transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProfileClick(match);
                            }}
                          >
                            {match.name}
                          </h3>
                          <p className="text-gray-600">{match.bio}</p>
                          <p className="text-sm text-gray-500">{status.statusText}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          status.statusText === 'Online now' ? 'bg-green-500' : 
                          status.statusText === 'Recently active' ? 'bg-yellow-500' : 
                          'bg-gray-400'
                        }`}></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMatch(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleProfileClick(selectedMatch)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedMatch.image} alt={selectedMatch.name} />
                <AvatarFallback>{selectedMatch.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h2 
                className="font-semibold cursor-pointer hover:text-hooks-coral transition-colors"
                onClick={() => handleProfileClick(selectedMatch)}
              >
                {selectedMatch.name}
              </h2>
              <p className={`text-sm ${
                matchStatus === 'Online now' ? 'text-green-500' :
                matchStatus === 'Recently active' ? 'text-yellow-600' :
                'text-gray-500'
              }`}>
                {matchStatus}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 container mx-auto px-4 py-4 max-w-2xl">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender === 'me'
                    ? 'bg-hooks-coral text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'me' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="flex space-x-4">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              className="gradient-coral text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
