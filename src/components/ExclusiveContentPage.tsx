
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CreatePostModal from "./CreatePostModal";
import TipModal from "./TipModal";
import ExclusiveContentModal from "./ExclusiveContentModal";
import PostCommentsModal from "./PostCommentsModal";
import ExclusivePostCard from "./ExclusivePostCard";
import ExclusiveContentEmptyState from "./ExclusiveContentEmptyState";
import ExclusiveContentHeader from "./ExclusiveContentHeader";
import PayPerViewModal from "./PayPerViewModal";

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
  const [showPPVModal, setShowPPVModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<{ id: string; name: string } | null>(null);
  const [selectedPost, setSelectedPost] = useState<ExclusivePost | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [selectedPPVPost, setSelectedPPVPost] = useState<ExclusivePost | null>(null);

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

  const handlePPVClick = (post: ExclusivePost) => {
    setSelectedPPVPost(post);
    setShowPPVModal(true);
  };

  const handlePPVPurchaseSuccess = () => {
    fetchPosts(); // Refresh posts to update access status
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
      <ExclusiveContentHeader 
        onBack={onBack}
        onCreatePost={() => setShowCreatePost(true)}
        userType={profile?.user_type}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ExclusivePostCard
              key={post.id}
              post={post}
              onContentClick={handleContentClick}
              onCommentsClick={handleCommentsClick}
              onTipClick={handleSendTip}
              onProfileClick={handleProfileClick}
              onPPVClick={handlePPVClick}
              currentUserId={user?.id}
            />
          ))}
        </div>

        {posts.length === 0 && (
          <ExclusiveContentEmptyState userType={profile?.user_type} />
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

      {/* Pay Per View Modal */}
      {showPPVModal && selectedPPVPost && (
        <PayPerViewModal
          isOpen={showPPVModal}
          onClose={() => {
            setShowPPVModal(false);
            setSelectedPPVPost(null);
          }}
          post={selectedPPVPost}
          onPurchaseSuccess={handlePPVPurchaseSuccess}
        />
      )}
    </div>
  );
};

export default ExclusiveContentPage;
