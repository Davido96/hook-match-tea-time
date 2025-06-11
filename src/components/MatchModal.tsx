
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Heart, MessageCircle, X } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: {
    id: number;
    name: string;
    image: string;
    age: number;
    bio: string;
  };
  onStartChatting: () => void;
}

const MatchModal = ({ isOpen, onClose, match, onStartChatting }: MatchModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple border-none">
        <div className="relative text-center p-8">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Match celebration */}
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">It's a Match!</h2>
            <p className="text-white/90">You and {match.name} liked each other</p>
          </div>

          {/* Match profile */}
          <div className="bg-white/20 rounded-2xl p-6 mb-6">
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-4 bg-cover bg-center border-4 border-white"
              style={{ backgroundImage: `url(${match.image})` }}
            />
            <h3 className="text-xl font-semibold text-white mb-1">{match.name}, {match.age}</h3>
            <p className="text-white/80 text-sm">{match.bio}</p>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-white text-white hover:bg-white hover:text-hooks-coral"
            >
              Keep Swiping
            </Button>
            <Button
              onClick={onStartChatting}
              className="flex-1 bg-white text-hooks-coral hover:bg-gray-100"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chatting
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchModal;
