import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Heart, MessageCircle, Share } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TipModal from "./TipModal";
import ProfileViewModal from "./ProfileViewModal";
import HookLogo from "@/components/HookLogo";

interface ExclusiveContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    creator_id: string;
    media_url: string;
    media_type: string;
    caption?: string;
    is_public: boolean;
    created_at: string;
    profiles: {
      name: string;
      avatar_url?: string;
      user_type: string;
    };
  };
}

const ExclusiveContentModal = ({ isOpen, onClose, post }: ExclusiveContentModalProps) => {
  const { user } = useAuth();
  const [showTipModal, setShowTipModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (!isOpen) return null;

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  const handleSendTip = () => {
    setShowTipModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full bg-hooks-coral flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-hooks-coral/80 transition-colors"
                onClick={handleProfileClick}
              >
                {post.profiles.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={post.profiles.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  post.profiles.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p 
                  className="font-semibold cursor-pointer hover:underline"
                  onClick={handleProfileClick}
                >
                  {post.profiles.name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {post.profiles.user_type === 'creator' ? 'Creator' : 'Member'}
                  </Badge>
                  {!post.is_public && (
                    <Badge className="bg-hooks-coral text-white text-xs">
                      Exclusive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex flex-col">
            {/* Media */}
            <div className="relative flex justify-center bg-gray-50">
              {post.media_type === 'video' ? (
                <video
                  src={post.media_url}
                  className="w-full max-h-[70vh] object-contain"
                  controls
                  autoPlay={false}
                />
              ) : (
                <img
                  src={post.media_url}
                  alt="Exclusive content"
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
            </div>

            {/* Caption and Actions */}
            <div className="p-4">
              {post.caption && (
                <p className="text-sm text-gray-700 mb-4">{post.caption}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">Like</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">Comment</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
                    <Share className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </Button>
                </div>
                
                {post.creator_id !== user?.id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-hooks-coral border-hooks-coral hover:bg-hooks-coral hover:text-white flex items-center gap-1"
                    onClick={handleSendTip}
                  >
                    Send Keys <HookLogo size="sm" />
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                {formatDate(post.created_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          recipientName={post.profiles.name}
          recipientId={post.creator_id}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileViewModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profile={{
            id: post.creator_id,
            name: post.profiles.name,
            avatar_url: post.profiles.avatar_url,
            user_type: post.profiles.user_type,
            isVerified: post.profiles.user_type === 'creator',
            // Add placeholder data for other required fields
            age: 25,
            location: 'Lagos, Nigeria',
            bio: 'Content creator',
            interests: [],
            subscriptionFee: 1000
          }}
        />
      )}
    </>
  );
};

export default ExclusiveContentModal;
