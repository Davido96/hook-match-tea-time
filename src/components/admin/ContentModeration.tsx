import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Image, Video, AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Post {
  id: string;
  creator_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  is_public: boolean;
  is_ppv: boolean;
  ppv_price?: number;
  created_at: string;
  profiles: {
    name: string;
    user_type: string;
  };
}

export const ContentModeration = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [moderationNotes, setModerationNotes] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('exclusive_posts')
        .select(`
          *,
          profiles:creator_id (name, user_type)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter === 'public') {
        query = query.eq('is_public', true);
      } else if (filter === 'private') {
        query = query.eq('is_public', false);
      } else if (filter === 'ppv') {
        query = query.eq('is_ppv', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('exclusive_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      // Send notification to creator
      const post = posts.find(p => p.id === postId);
      if (post) {
        await supabase.from('notifications').insert({
          user_id: post.creator_id,
          type: 'content_removed',
          title: 'Content Removed',
          message: `Your post has been removed by moderation. ${moderationNotes || ''}`,
          data: { post_id: postId, reason: moderationNotes }
        });
      }

      toast({
        title: "Success",
        description: "Post deleted and creator notified",
      });

      fetchPosts();
      setSelectedPost(null);
      setModerationNotes('');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const handleViewMedia = (post: Post) => {
    setSelectedPost(post);
    setShowMediaModal(true);
  };

  if (loading) {
    return <div>Loading content...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Moderation</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="ppv">Pay-Per-View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  {post.media_type === 'image' ? (
                    <img
                      src={post.media_url}
                      alt="Post"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => handleViewMedia(post)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center cursor-pointer"
                      onClick={() => handleViewMedia(post)}
                    >
                      <Video className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {post.is_public && (
                      <Badge className="bg-green-100 text-green-800">Public</Badge>
                    )}
                    {post.is_ppv && (
                      <Badge className="bg-yellow-100 text-yellow-800">PPV</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="mb-2">
                    <p className="font-medium text-sm">{post.profiles?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {post.caption && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {post.caption}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleViewMedia(post)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPost(post);
                        const notes = prompt('Enter reason for removal (will be sent to creator):');
                        if (notes !== null) {
                          setModerationNotes(notes);
                          handleDeletePost(post.id);
                        }
                      }}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No posts found
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Content Review</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted">
                {selectedPost.media_type === 'image' ? (
                  <img
                    src={selectedPost.media_url}
                    alt="Post"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedPost.media_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">Creator: {selectedPost.profiles?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Posted: {format(new Date(selectedPost.created_at), 'PPP')}
                </p>
                {selectedPost.caption && (
                  <p className="text-sm mt-2">{selectedPost.caption}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
