
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share, Lock, Play, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CreatePostModal from "./CreatePostModal";
import ExclusiveContentModal from "./ExclusiveContentModal";
import TipModal from "./TipModal";

interface Post {
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

interface ProfilePostTimelineProps {
  userId: string;
  isSubscribed: boolean;
  isOwnProfile: boolean;
  onSubscriptionStatusChange?: () => void;
}

const ProfilePostTimeline = ({ userId, isSubscribed, isOwnProfile, onSubscriptionStatusChange }: ProfilePostTimelineProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [userId, isSubscribed]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log('Fetching posts for user:', userId, 'isSubscribed:', isSubscribed, 'isOwnProfile:', isOwnProfile);
      
      let query = supabase
        .from('exclusive_posts')
        .select(`
          *,
          profiles:creator_id (
            name,
            avatar_url,
            user_type
          )
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      // If user is not subscribed and not the owner, only show public posts
      if (!isSubscribed && !isOwnProfile) {
        query = query.eq('is_public', true);
        console.log('User not subscribed, showing only public posts');
      } else {
        console.log('User is subscribed or owner, showing all posts');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Fetched posts:', data?.length || 0);
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

  const handlePostClick = (post: Post) => {
    // Check if user can access this post
    if (!post.is_public && !isSubscribed && !isOwnProfile) {
      console.log('Cannot access private post - not subscribed');
      return; // Can't access private post
    }
    
    console.log('Opening post:', post.id, 'isPublic:', post.is_public);
    setSelectedPost(post);
    setShowContentModal(true);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hooks-coral mx-auto mb-2"></div>
          <div>Loading posts...</div>
        </div>
      </div>
    );
  }

  const publicPosts = posts.filter(post => post.is_public);
  const privatePosts = posts.filter(post => !post.is_public);
  const canViewPrivatePosts = isSubscribed || isOwnProfile;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Create Post Button for own profile */}
      {isOwnProfile && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <Button
              onClick={() => setShowCreatePost(true)}
              className="w-full gradient-coral text-white"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Post
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content Access Info */}
      {!isOwnProfile && (
        <div className="mb-6">
          {isSubscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Premium Access Unlocked</p>
                  <p className="text-green-600 text-sm">You can view all content from this creator</p>
                </div>
              </div>
            </div>
          ) : privatePosts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium">Exclusive Content Available</p>
                  <p className="text-blue-600 text-sm">Subscribe to unlock {privatePosts.length} exclusive posts</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts Timeline */}
      <div className="space-y-4">
        {posts.map((post) => {
          const canAccess = post.is_public || canViewPrivatePosts;
          
          return (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Post Header */}
                <div className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(post.created_at)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {!post.is_public && (
                        <Badge variant="secondary" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Subscribers Only
                        </Badge>
                      )}
                      {canAccess && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          <Eye className="w-3 h-3 mr-1" />
                          Accessible
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Media */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  {canAccess ? (
                    <div className="flex justify-center bg-gray-50">
                      {post.media_type === 'video' ? (
                        <div className="relative w-full">
                          <video
                            src={post.media_url}
                            className="w-full max-h-80 object-contain"
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={post.media_url}
                          alt="Post content"
                          className="w-full max-h-80 object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600 font-medium">Subscribe to view this content</p>
                        <p className="text-sm text-gray-500">Exclusive content for subscribers</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="p-4">
                  {post.caption && canAccess && (
                    <p className="text-gray-800 mb-3">{post.caption}</p>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="text-sm">0</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">0</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600">
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {!isOwnProfile && user && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-hooks-coral"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTipModal(true);
                        }}
                      >
                        Send Keys 🪝
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {isOwnProfile ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p>Start sharing content with your followers!</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold mb-2">No posts available</h3>
                  <p>This user hasn't shared any content yet.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreatePost && (
        <CreatePostModal 
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}

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

      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          recipientName="Creator"
          recipientId={userId}
        />
      )}
    </div>
  );
};

export default ProfilePostTimeline;
