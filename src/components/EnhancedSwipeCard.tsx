import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Heart, X, User, Crown, Zap, CheckCircle, Clock } from "lucide-react";
import FollowSubscribeButtons from "./FollowSubscribeButtons";

interface User {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
  interests: string[];
  distance: string;
  location?: string;
  gender?: string;
  user_type?: 'creator' | 'consumer';
  verification_status?: 'verified' | 'pending' | 'rejected';
  subscriber_count?: number;
  last_active?: string;
  subscriptionFee?: number;
  follower_count?: number;
}

interface EnhancedSwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  onSuperLike?: () => void;
  onViewProfile: () => void;
  canUndo?: boolean;
}

const EnhancedSwipeCard = ({ user, onSwipe, onSuperLike, onViewProfile, canUndo }: EnhancedSwipeCardProps) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'super' | null>(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setStartY(e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    setCurrentX(deltaX);
    setCurrentY(deltaY);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    const superLikeThreshold = -150;
    
    if (currentY < superLikeThreshold && onSuperLike) {
      setSwipeDirection('super');
      setTimeout(() => onSuperLike(), 100);
    } else if (Math.abs(currentX) > threshold) {
      const direction = currentX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setTimeout(() => onSwipe(direction), 100);
    } else {
      setCurrentX(0);
      setCurrentY(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    setCurrentX(deltaX);
    setCurrentY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    const superLikeThreshold = -150;
    
    if (currentY < superLikeThreshold && onSuperLike) {
      setSwipeDirection('super');
      setTimeout(() => onSuperLike(), 100);
    } else if (Math.abs(currentX) > threshold) {
      const direction = currentX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setTimeout(() => onSwipe(direction), 100);
    } else {
      setCurrentX(0);
      setCurrentY(0);
    }
  };

  const handleMouseEnter = () => setShowQuickActions(true);
  const handleMouseLeave = () => {
    setShowQuickActions(false);
    if (isDragging) {
      handleMouseUp();
    }
  };

  const rotation = currentX * 0.1;
  const opacity = 1 - Math.abs(currentX) / 300;
  const scale = 1 - Math.abs(currentY) / 1000;

  const getLastActiveText = (lastActive?: string) => {
    if (!lastActive) return null;
    const now = new Date();
    const active = new Date(lastActive);
    const diffHours = Math.floor((now.getTime() - active.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Active now";
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    return `Active ${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card 
      className={`absolute inset-0 cursor-grab active:cursor-grabbing card-swipe transition-all duration-200 overflow-hidden shadow-xl ${
        swipeDirection === 'right' ? 'animate-swipe-right' : 
        swipeDirection === 'left' ? 'animate-swipe-left' :
        swipeDirection === 'super' ? 'animate-scale-out' : ''
      }`}
      style={{
        transform: `translateX(${currentX}px) translateY(${currentY}px) rotate(${rotation}deg) scale(${scale})`,
        opacity: isDragging ? opacity : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-0 h-full relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${user.image})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        
        {/* Verification Badge */}
        {user.verification_status === 'verified' && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-bold shadow-lg">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </div>
        )}

        {/* Creator Badge - Only show for creators */}
        {user.user_type === 'creator' && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-hooks-coral to-hooks-pink text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-bold shadow-lg">
            <Crown className="w-3 h-3" />
            <span>Creator</span>
          </div>
        )}

        {/* Super Like Indicator */}
        {currentY < -50 && onSuperLike && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-6 py-3 rounded-full flex items-center space-x-2 font-bold shadow-lg text-lg">
            <Zap className="w-6 h-6" />
            <span>SUPER LIKE</span>
          </div>
        )}
        
        {/* Swipe Indicators */}
        {currentX > 50 && (
          <div className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 font-bold shadow-lg">
            <Heart className="w-5 h-5" />
            <span>LIKE</span>
          </div>
        )}
        {currentX < -50 && (
          <div className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 font-bold shadow-lg">
            <X className="w-5 h-5" />
            <span>NOPE</span>
          </div>
        )}

        {/* Quick Action Buttons */}
        {showQuickActions && !isDragging && (
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-2 opacity-90">
            <Button
              size="sm"
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
              onClick={(e) => {
                e.stopPropagation();
                onViewProfile();
              }}
            >
              <User className="w-5 h-5 text-white" />
            </Button>
            
            {/* Show FollowSubscribeButtons for all user types */}
            <div className="w-12">
              <FollowSubscribeButtons
                targetUserId={user.id.toString()}
                targetUserType={user.user_type || 'consumer'}
                subscriptionFee={user.subscriptionFee}
                className="flex flex-col space-y-1"
                size="sm"
                showBothButtons={true}
              />
            </div>
          </div>
        )}
        
        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-3xl font-bold">{user.name}</h2>
              <span className="text-2xl font-light">{user.age}</span>
            </div>
            
            {/* Activity Status */}
            {getLastActiveText(user.last_active) && (
              <div className="flex items-center space-x-1 text-green-400 text-sm">
                <Clock className="w-3 h-3" />
                <span>{getLastActiveText(user.last_active)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1 text-white/80">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{user.distance}</span>
            </div>
            
            {/* Social Proof - Show different stats based on user type */}
            <div className="flex items-center space-x-4 text-sm text-white/80">
              {user.follower_count && (
                <span>{user.follower_count} followers</span>
              )}
              {/* Only show subscriber count for creators */}
              {user.user_type === 'creator' && user.subscriber_count && (
                <span>{user.subscriber_count} subscribers</span>
              )}
            </div>
          </div>
          
          <p className="text-white/90 mb-4 text-lg line-clamp-2">{user.bio}</p>
          
          <div className="flex flex-wrap gap-2">
            {user.interests.slice(0, 3).map((interest, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {interest}
              </Badge>
            ))}
            {user.interests.length > 3 && (
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30"
              >
                +{user.interests.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSwipeCard;
