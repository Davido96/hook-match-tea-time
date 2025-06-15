
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePostCommentCount = (postId: string) => {
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchCommentCount();
    }
  }, [postId]);

  const fetchCommentCount = async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (error) throw error;
      setCommentCount(count || 0);
    } catch (error) {
      console.error('Error fetching comment count:', error);
      setCommentCount(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    commentCount,
    loading,
    refetch: fetchCommentCount
  };
};
