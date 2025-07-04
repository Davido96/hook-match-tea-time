import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Play, Lock, Clock, Eye } from "lucide-react";
import { usePostLikes } from "@/hooks/usePostLikes";
import { usePostCommentCount } from "@/hooks/usePostCommentCount";
import { usePostAccess } from "@/hooks/usePostAccess";
import HookLogo from "@/components/HookLogo";

interface ExclusivePost {
  id: string;
  creator_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  is_public: boolean;
  is_ppv?: boolean;
  ppv_price?: number;
  ppv_unlock_duration?: number;
  created_at: string;
  profiles: {
    name: string;
    avatar_url?: string;
    user_type: string;
  };
}

interface ExclusivePostCardProps {
  post: ExclusivePost;
  onContentClick: (post: ExclusivePost) => void;
  onCommentsClick: (postId: string, e: React.MouseEvent) => void;
  onTipClick: (creatorId: string, creatorName: string) => void;
  onProfileClick: (creatorId: string) => void;
  onPPVClick: (post: ExclusivePost) => void;
  currentUserId?: string;
}

const ExclusivePostCard = ({ 
  post, 
  onContentClick, 
  onCommentsClick, 
  onTipClick, 
  onProfileClick,
  onPPVClick,
  currentUserId 
}: ExclusivePostCardProps) => {
  const { likeCount, isLiked, loading: likeLoading, toggleLike } = usePostLikes(post.id);
  const { commentCount } = usePostCommentCount(post.id);
  const { hasAccess, loading: accessLoading, purchaseInfo } = usePostAccess(post.id);

  const isOwner = currentUserId === post.creator_id;
  const canViewContent = isOwner || hasAccess || post.is_public;
  const isPPVContent = post.is_ppv && post.ppv_price;
  const needsPurchase = isPPVContent && !isOwner && !hasAccess;

  const formatDuration = (hours?: number) => {
    if (!hours) return "Permanent";
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const handleContentClick = () => {
    if (canViewContent) {
      onContentClick(post);
    } else if (isPPVContent) {
      onPPVClick(post);
    }
  };

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative" onClick={handleContentClick}>
        {post.media_type === 'video' ? (
          <div className="relative">
            <video
              src={post.media_url}
              className={`w-full h-64 object-cover ${!canViewContent ? 'filter blur-sm' : ''}`}
              preload="metadata"
            />
            {!canViewContent ? (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-12 h-12 mx-auto mb-2" />
                  {isPPVContent && (
                    <div className="space-y-1">
                      <p className="text-lg font-semibold flex items-center justify-center gap-1">
                        {post.ppv_price} <HookLogo size="sm" />
                      </p>
                      <p className="text-sm opacity-90">
                        {formatDuration(post.ppv_unlock_duration)} access
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play className="w-12 h-12 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <img
              src={post.media_url}
              alt="Exclusive content"
              className={`w-full h-64 object-cover ${!canViewContent ? 'filter blur-sm' : ''}`}
            />
            {!canViewContent && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-12 h-12 mx-auto mb-2" />
                  {isPPVContent && (
                    <div className="space-y-1">
                      <p className="text-lg font-semibold flex items-center justify-center gap-1">
                        {post.ppv_price} <HookLogo size="sm" />
                      </p>
                      <p className="text-sm opacity-90">
                        {formatDuration(post.ppv_unlock_duration)} access
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {post.is_public && (
            <Badge className="bg-green-500 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}
          {isPPVContent && (
            <Badge className="bg-purple-500 text-white">
              <Lock className="w-3 h-3 mr-1" />
              PPV
            </Badge>
          )}
          {!post.is_public && !isPPVContent && (
            <Badge className="bg-hooks-coral text-white">
              Subscribers Only
            </Badge>
          )}
          {purchaseInfo?.expires_at && (
            <Badge className="bg-blue-500 text-white">
              <Clock className="w-3 h-3 mr-1" />
              Expires {new Date(purchaseInfo.expires_at).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div 
            className="w-8 h-8 rounded-full bg-hooks-coral flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:bg-hooks-coral/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onProfileClick(post.creator_id);
            }}
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
              className="font-semibold text-sm cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick(post.creator_id);
              }}
            >
              {post.profiles.name}
            </p>
            <Badge variant="outline" className="text-xs">
              {post.profiles.user_type === 'creator' ? 'Creator' : 'Member'}
            </Badge>
          </div>
        </div>
        {post.caption && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.caption}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              className={`${isLiked ? 'text-red-500' : 'text-gray-600'}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
              disabled={likeLoading}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likeCount}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600"
              onClick={(e) => onCommentsClick(post.id, e)}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">{commentCount}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {needsPurchase && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onPPVClick(post);
                }}
              >
                <Lock className="w-3 h-3 mr-1" />
                Unlock {post.ppv_price} Keys
              </Button>
            )}
            {post.creator_id !== currentUserId && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-hooks-coral flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onTipClick(post.creator_id, post.profiles.name);
                }}
              >
                Send Tips <HookLogo size="sm" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExclusivePostCard;
