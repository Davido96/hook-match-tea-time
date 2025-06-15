
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Heart, MessageCircle, Upload, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePostLikes } from "@/hooks/usePostLikes";
import CreatePostModal from "./CreatePostModal";
import TipModal from "./TipModal";
import ExclusiveContentModal from "./ExclusiveContentModal";
import PostCommentsModal from "./PostCommentsModal";
import HookLogo from "@/components/HookLogo";

interface ExclusivePost {
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
}

interface ExclusiveContentPageProps {
  onBack: () => void;
}

const ExclusiveContentPage = ({ onBack }: ExclusiveContentPageProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ExclusivePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<{ id: string; name: string } | null>(null);
  const [selectedPost, setSelectedPost] = useState<ExclusivePost | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('exclusive_posts')
        .select(`
          *,
          profiles:creator_id (
            name,
            avatar_url,
            user_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
    setShowCreatePost(false);
  };

  const handleSendTip = (creatorId: string, creatorName: string) => {
    setSelectedCreator({ id: creatorId, name: creatorName });
    setShowTipModal(true);
  };

  const handleContentClick = (post: ExclusivePost) => {
    setSelectedPost(post);
    setShowContentModal(true);
  };

  const handleCommentsClick = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPostForComments(postId);
    setShowCommentsModal(true);
  };

  const handleProfileClick = (creatorId: string) => {
    navigate(`/profile/${creatorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">Loading exclusive content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold">Exclusive Content</h1>
            </div>
            {profile?.user_type === 'creator' && (
              <Button
                onClick={() => setShowCreatePost(true)}
                className="gradient-coral text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onContentClick={handleContentClick}
              onCommentsClick={handleCommentsClick}
              onTipClick={handleSendTip}
              onProfileClick={handleProfileClick}
              currentUserId={user?.id}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No exclusive content yet</h3>
            <p className="text-gray-500">
              {profile?.user_type === 'creator' 
                ? "Start sharing exclusive content with your subscribers"
                : "Follow creators to see their exclusive content"
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal 
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* Tip Modal */}
      {showTipModal && selectedCreator && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => {
            setShowTipModal(false);
            setSelectedCreator(null);
          }}
          recipientName={selectedCreator.name}
          recipientId={selectedCreator.id}
        />
      )}

      {/* Content Modal */}
      {showContentModal && selectedPost && (
        <ExclusiveContentModal
          isOpen={showContentModal}
          onClose={() => {
            setShowContentModal(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedPostForComments && (
        <PostCommentsModal
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedPostForComments(null);
          }}
          postId={selectedPostForComments}
        />
      )}
    </div>
  );
};

// Separate PostCard component with functional like/comment buttons
const PostCard = ({ 
  post, 
  onContentClick, 
  onCommentsClick, 
  onTipClick, 
  onProfileClick,
  currentUserId 
}: {
  post: ExclusivePost;
  onContentClick: (post: ExclusivePost) => void;
  onCommentsClick: (postId: string, e: React.MouseEvent) => void;
  onTipClick: (creatorId: string, creatorName: string) => void;
  onProfileClick: (creatorId: string) => void;
  currentUserId?: string;
}) => {
  const { likeCount, isLiked, loading: likeLoading, toggleLike } = usePostLikes(post.id);

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative" onClick={() => onContentClick(post)}>
        {post.media_type === 'video' ? (
          <div className="relative">
            <video
              src={post.media_url}
              className="w-full h-64 object-cover"
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Play className="w-12 h-12 text-white" />
            </div>
          </div>
        ) : (
          <img
            src={post.media_url}
            alt="Exclusive content"
            className="w-full h-64 object-cover"
          />
        )}
        {!post.is_public && (
          <Badge className="absolute top-2 right-2 bg-hooks-coral text-white">
            Subscribers Only
          </Badge>
        )}
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
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
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
              Send Keys <HookLogo size="sm" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExclusiveContentPage;
