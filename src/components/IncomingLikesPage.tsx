
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Users, MessageCircle } from "lucide-react";
import { useIncomingLikes } from "@/hooks/useIncomingLikes";
import IncomingLikeCard from "@/components/IncomingLikeCard";
import HookLogo from "@/components/HookLogo";

interface IncomingLikesPageProps {
  onBack: () => void;
  onNavigateToMessages?: () => void;
}

const IncomingLikesPage = ({ onBack, onNavigateToMessages }: IncomingLikesPageProps) => {
  const { incomingLikes, loading, processing, acceptLike, rejectLike } = useIncomingLikes();
  const [processingLike, setProcessingLike] = useState<string | null>(null);

  const handleAccept = async (likeId: string) => {
    setProcessingLike(likeId);
    const success = await acceptLike(likeId);
    setProcessingLike(null);
    
    if (success && onNavigateToMessages) {
      // Show a brief success message then navigate to messages
      setTimeout(() => {
        onNavigateToMessages();
      }, 2000);
    }
  };

  const handleReject = async (likeId: string) => {
    setProcessingLike(likeId);
    await rejectLike(likeId);
    setProcessingLike(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple flex items-center justify-center">
        <div className="text-white text-xl">Loading likes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hooks-coral via-hooks-pink to-hooks-purple">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-white" />
                <h1 className="text-xl font-bold text-white">
                  Likes ({incomingLikes.length})
                </h1>
              </div>
            </div>
            
            {/* Messages Button */}
            {onNavigateToMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToMessages}
                className="text-white hover:bg-white/20"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Messages
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {incomingLikes.length === 0 ? (
          <div className="max-w-md mx-auto text-center mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="mb-6">
                <HookLogo size="lg" />
              </div>
              <Users className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">No likes yet</h2>
              <p className="text-white/80 mb-6">
                When someone likes you, they'll appear here. You can then choose to like them back for an instant match!
              </p>
              <Button
                onClick={onBack}
                className="bg-white text-hooks-coral hover:bg-white/90"
              >
                Start Discovering
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {incomingLikes.length} {incomingLikes.length === 1 ? 'person likes' : 'people like'} you!
              </h2>
              <p className="text-white/80">
                Like them back for an instant match and start chatting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingLikes.map((like) => (
                <IncomingLikeCard
                  key={like.like_id}
                  like={like}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  processing={processing === like.like_id || processingLike === like.like_id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingLikesPage;
