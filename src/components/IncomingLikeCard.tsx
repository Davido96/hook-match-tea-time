
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, X, MapPin, Star, Loader2 } from "lucide-react";

interface IncomingLike {
  like_id: string;
  sender_id: string;
  sender_name: string;
  sender_age: number;
  sender_bio?: string;
  sender_avatar_url?: string;
  sender_interests: string[];
  sender_location_city: string;
  sender_location_state: string;
  sender_user_type: 'creator' | 'consumer';
  sender_verification_status: string;
  is_super_like: boolean;
  created_at: string;
}

interface IncomingLikeCardProps {
  like: IncomingLike;
  onAccept: (likeId: string) => void;
  onReject: (likeId: string) => void;
  processing: boolean;
}

const IncomingLikeCard = ({ like, onAccept, onReject, processing }: IncomingLikeCardProps) => {
  const timeAgo = new Date(like.created_at).toLocaleDateString();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          {/* Profile Image */}
          <div className="aspect-[4/5] bg-gray-100 relative">
            <img
              src={like.sender_avatar_url || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=600&fit=crop'}
              alt={like.sender_name}
              className="w-full h-full object-cover"
            />
            
            {/* Super Like Badge */}
            {like.is_super_like && (
              <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-sm font-medium">
                <Star className="w-4 h-4 fill-current" />
                <span>SUPER</span>
              </div>
            )}

            {/* User Type Badge */}
            <div className="absolute top-3 right-3">
              <Badge className={like.sender_user_type === 'creator' ? 'bg-hooks-coral' : 'bg-hooks-blue'}>
                {like.sender_user_type === 'creator' ? 'Creator' : 'Member'}
              </Badge>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">{like.sender_name}</h3>
                <span className="text-gray-500">{like.sender_age}</span>
                {like.sender_verification_status === 'verified' && (
                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                    ✓
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{like.sender_location_city}, {like.sender_location_state}</span>
            </div>

            {like.sender_bio && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {like.sender_bio}
              </p>
            )}

            {/* Interests */}
            {like.sender_interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {like.sender_interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {like.sender_interests.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{like.sender_interests.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(like.like_id)}
                disabled={processing}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Pass
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                onClick={() => onAccept(like.like_id)}
                disabled={processing}
                className="flex-1 gradient-coral text-white"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-1" />
                    Like Back
                  </>
                )}
              </Button>
            </div>

            {/* Time stamp */}
            <p className="text-xs text-gray-500 mt-2 text-center">
              {like.is_super_like ? 'Super liked' : 'Liked'} you on {timeAgo}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomingLikeCard;
