
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    name: string;
    avatar_url?: string;
  };
}

export const usePostComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles!post_comments_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user) {
      toast.error("Please login to comment");
      return false;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return false;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          *,
          profiles!post_comments_user_id_fkey (
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      toast.success("Comment added successfully");
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error("Failed to add comment");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast.success("Comment deleted");
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Failed to delete comment");
      return false;
    }
  };

  return {
    comments,
    loading,
    submitting,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
