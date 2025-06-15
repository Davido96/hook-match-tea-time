
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, X } from "lucide-react";

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
  matchedUser: User | null;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

const MatchModal = ({ isOpen, onClose, matchedUser, onSendMessage, onKeepSwiping }: MatchModalProps) => {
  if (!matchedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-pink-50 to-rose-50 border-0 shadow-2xl">
        <div className="text-center space-y-6 p-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Match celebration */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <Heart className="w-16 h-16 text-red-500 animate-pulse" fill="currentColor" />
                <div className="absolute inset-0 animate-ping">
                  <Heart className="w-16 h-16 text-red-300" fill="currentColor" />
                </div>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-600">
              It's a Match!
            </h2>
            
            <p className="text-gray-600">
              You and {matchedUser.name} liked each other
            </p>
          </div>

          {/* User avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={matchedUser.image} alt={matchedUser.name} />
                <AvatarFallback className="text-2xl">{matchedUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                <Heart className="w-4 h-4" fill="currentColor" />
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{matchedUser.name}, {matchedUser.age}</h3>
            <p className="text-gray-600 text-sm">{matchedUser.bio}</p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={onSendMessage}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold py-3"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Send Message
            </Button>
            
            <Button
              onClick={onKeepSwiping}
              variant="outline"
              className="w-full border-2 border-gray-300 hover:border-gray-400"
            >
              Keep Swiping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
