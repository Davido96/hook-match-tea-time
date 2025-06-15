
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, X } from "lucide-react";
import { useLikes } from "@/hooks/useLikes";

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

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  onMatch?: (user: User) => void;
}

const SwipeCard = ({ user, onSwipe, onMatch }: SwipeCardProps) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { createLike, checkMutualLike } = useLikes();

  const handleSwipeComplete = async (direction: 'left' | 'right') => {
    if (direction === 'right') {
      console.log('Creating like for user:', user.user_id);
      const success = await createLike(user.user_id, false);
      
      if (success) {
        // Check if this creates a match
        const isMatch = await checkMutualLike(user.user_id);
        if (isMatch && onMatch) {
          console.log('Match detected!', user.name);
          onMatch(user);
        }
      }
    }
    
    onSwipe(direction);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(currentX) > threshold) {
      const direction = currentX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setTimeout(() => handleSwipeComplete(direction), 100);
    } else {
      setCurrentX(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(currentX) > threshold) {
      const direction = currentX > 0 ? 'right' : 'left';
      setSwipeDirection(direction);
      setTimeout(() => handleSwipeComplete(direction), 100);
    } else {
      setCurrentX(0);
    }
  };

  const rotation = currentX * 0.1;
  const opacity = 1 - Math.abs(currentX) / 300;

  return (
    <Card 
      className={`absolute inset-0 cursor-grab active:cursor-grabbing card-swipe transition-transform duration-200 overflow-hidden shadow-lg ${
        swipeDirection === 'right' ? 'animate-swipe-right' : 
        swipeDirection === 'left' ? 'animate-swipe-left' : ''
      }`}
      style={{
        transform: `translateX(${currentX}px) rotate(${rotation}deg)`,
        opacity: isDragging ? opacity : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <CardContent className="p-0 h-full relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${user.image})` }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
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
        
        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <span className="text-2xl font-light">{user.age}</span>
          </div>
          
          <div className="flex items-center space-x-1 mb-3 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{user.distance}</span>
          </div>
          
          <p className="text-white/90 mb-4 text-lg">{user.bio}</p>
          
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwipeCard;
