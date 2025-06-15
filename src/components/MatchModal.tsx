
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, X, Sparkles } from "lucide-react";

interface User {
  id: number;
  user_id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  interests: string[];
  distance: string;
}

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: User | null;
  onStartChatting: () => void;
}

const MatchModal = ({ isOpen, onClose, match, onStartChatting }: MatchModalProps) => {
  if (!match) return null;

  const handleStartChatting = () => {
    console.log('Starting chat with match:', match.name, match.user_id);
    onStartChatting();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border-0 shadow-2xl overflow-hidden">
        <div className="text-center space-y-6 p-4 relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 left-4 animate-bounce delay-100">
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
            <div className="absolute top-8 right-6 animate-bounce delay-300">
              <Sparkles className="w-3 h-3 text-rose-400" />
            </div>
            <div className="absolute bottom-12 left-8 animate-bounce delay-500">
              <Sparkles className="w-5 h-5 text-orange-400" />
            </div>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Match celebration */}
          <div className="space-y-4 relative z-10">
            <div className="flex justify-center">
              <div className="relative">
                <Heart className="w-20 h-20 text-red-500 animate-pulse" fill="currentColor" />
                <div className="absolute inset-0 animate-ping">
                  <Heart className="w-20 h-20 text-red-300" fill="currentColor" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 animate-pulse">
                It's a Match!
              </h2>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
            
            <p className="text-gray-700 font-medium">
              🎉 You and {match.name} liked each other!
            </p>
          </div>

          {/* User avatar with celebration ring */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 animate-spin"></div>
              <div className="relative bg-white rounded-full p-1">
                <Avatar className="w-36 h-36 border-4 border-white shadow-lg">
                  <AvatarImage src={match.image} alt={match.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-pink-100 to-rose-100">
                    {match.name[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full p-3 shadow-lg">
                <Heart className="w-5 h-5" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-800">{match.name}, {match.age}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{match.bio}</p>
            {match.interests && match.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {match.interests.slice(0, 3).map((interest, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleStartChatting}
              className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 hover:from-pink-600 hover:via-rose-600 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <MessageCircle className="w-6 h-6 mr-2" />
              Start Chatting Now! 💬
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 py-3"
            >
              Keep Discovering
            </Button>
          </div>

          {/* Fun message */}
          <p className="text-xs text-gray-500 italic">
            🚀 Your conversation will automatically start with a welcome message!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
