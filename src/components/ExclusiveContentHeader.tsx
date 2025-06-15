
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

interface ExclusiveContentHeaderProps {
  onBack: () => void;
  onCreatePost: () => void;
  userType?: string;
}

const ExclusiveContentHeader = ({ onBack, onCreatePost, userType }: ExclusiveContentHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Exclusive Content</h1>
          </div>
          {userType === 'creator' && (
            <Button
              onClick={onCreatePost}
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
  );
};

export default ExclusiveContentHeader;
