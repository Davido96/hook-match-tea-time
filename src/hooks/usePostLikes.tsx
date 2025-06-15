
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const usePostLikes = (postId: string) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<any[]>([]);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchLikes();
    }
  }, [postId, user]);

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;

      setLikes(data || []);
      setLikeCount(data?.length || 0);
      setIsLiked(user ? data?.some(like => like.user_id === user.id) || false : false);
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount(prev => prev - 1);
        setLikes(prev => prev.filter(like => like.user_id !== user.id));
      } else {
        // Add like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        setLikes(prev => [...prev, { post_id: postId, user_id: user.id, created_at: new Date().toISOString() }]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  return {
    likes,
    likeCount,
    isLiked,
    loading,
    toggleLike,
    refetch: fetchLikes
  };
};
