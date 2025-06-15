
import { Button } from "@/components/ui/button";
import { Plus, Crown } from "lucide-react";
import { useState } from "react";
import CreatePostModal from "./CreatePostModal";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface ExclusiveContentHeaderProps {
  onPostCreated?: () => void;
}

const ExclusiveContentHeader = ({ onPostCreated }: ExclusiveContentHeaderProps) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { profile } = useProfile();
  const { toast } = useToast();

  const handleCreatePostClick = () => {
    // Verify user is a creator before allowing post creation
    if (profile?.user_type !== 'creator') {
      toast({
        title: "Creator Status Required",
        description: "You need to be a Creator to create posts. Please upgrade your account first.",
        variant: "destructive"
      });
      return;
    }
    
    setShowCreatePost(true);
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    onPostCreated?.();
  };

  // Only show the create button for creators
  if (profile?.user_type !== 'creator') {
    return (
      <div className="bg-gradient-to-r from-hooks-coral/10 to-hooks-pink/10 rounded-lg p-6 text-center">
        <Crown className="w-8 h-8 mx-auto mb-3 text-hooks-coral" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Creator Content</h2>
        <p className="text-gray-600">
          This section is for creators to share exclusive content with their subscribers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Content</h1>
        <p className="text-gray-600">Share exclusive content with your subscribers</p>
      </div>
      
      <Button 
        onClick={handleCreatePostClick}
        className="gradient-coral text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Post
      </Button>

      {showCreatePost && (
        <CreatePostModal 
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default ExclusiveContentHeader;
