
import { Button } from "@/components/ui/button";
import { Heart, X, User, Zap, RotateCcw, Star } from "lucide-react";
import { useState } from "react";

interface EnhancedActionBarProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onViewProfile: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  superLikesRemaining?: number;
  disabled?: boolean;
}

const EnhancedActionBar = ({ 
  onPass, 
  onLike, 
  onSuperLike, 
  onViewProfile, 
  onUndo,
  canUndo = false,
  superLikesRemaining = 3,
  disabled = false 
}: EnhancedActionBarProps) => {
  const [isAnimating, setIsAnimating] = useState<string | null>(null);

  const handleAction = (action: () => void, animationType: string) => {
    if (disabled) return;
    setIsAnimating(animationType);
    setTimeout(() => {
      action();
      setIsAnimating(null);
    }, 150);
  };

  return (
    <div className="flex justify-center items-center space-x-4 px-4">
      {/* Undo Button */}
      {canUndo && onUndo && (
        <Button
          size="lg"
          variant="outline"
          className="w-12 h-12 rounded-full border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          onClick={() => handleAction(onUndo, 'undo')}
          disabled={disabled}
        >
          <RotateCcw className={`w-5 h-5 transition-transform ${isAnimating === 'undo' ? 'scale-110' : ''}`} />
        </Button>
      )}

      {/* Pass Button */}
      <Button
        size="lg"
        variant="outline"
        className="w-16 h-16 rounded-full border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 hover:text-red-600 disabled:opacity-50 transition-all duration-200"
        onClick={() => handleAction(onPass, 'pass')}
        disabled={disabled}
      >
        <X className={`w-8 h-8 transition-transform ${isAnimating === 'pass' ? 'scale-110 rotate-90' : ''}`} />
      </Button>
      
      {/* View Profile Button */}
      <Button
        size="lg"
        className="w-14 h-14 rounded-full bg-white text-hooks-coral hover:bg-gray-50 shadow-lg disabled:opacity-50 transition-all duration-200"
        onClick={() => handleAction(onViewProfile, 'profile')}
        disabled={disabled}
      >
        <User className={`w-6 h-6 transition-transform ${isAnimating === 'profile' ? 'scale-110' : ''}`} />
      </Button>

      {/* Super Like Button */}
      <Button
        size="lg"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg disabled:opacity-50 transition-all duration-200 relative"
        onClick={() => handleAction(onSuperLike, 'super')}
        disabled={disabled || superLikesRemaining <= 0}
      >
        <Zap className={`w-6 h-6 transition-transform ${isAnimating === 'super' ? 'scale-110' : ''}`} />
        {superLikesRemaining > 0 && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {superLikesRemaining}
          </div>
        )}
      </Button>
      
      {/* Like Button */}
      <Button
        size="lg"
        className="w-16 h-16 rounded-full gradient-coral shadow-lg disabled:opacity-50 transition-all duration-200"
        onClick={() => handleAction(onLike, 'like')}
        disabled={disabled}
      >
        <Heart className={`w-8 h-8 transition-transform ${isAnimating === 'like' ? 'scale-110' : ''}`} />
      </Button>
    </div>
  );
};

export default EnhancedActionBar;
