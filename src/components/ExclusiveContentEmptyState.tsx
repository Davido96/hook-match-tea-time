
import { Upload, PlayCircle, Image, Zap, Heart, TrendingUp } from "lucide-react";

interface ExclusiveContentEmptyStateProps {
  userType?: string;
}

const ExclusiveContentEmptyState = ({ userType }: ExclusiveContentEmptyStateProps) => {
  if (userType === 'creator') {
    return (
      <div className="text-center py-12 px-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-hooks-coral/20 to-hooks-pink/20 rounded-full"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-hooks-coral animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Start Creating Amazing Content!</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Share exclusive photos and videos with your subscribers. Video content gets 3x more engagement!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          <div className="bg-gradient-to-br from-hooks-coral/10 to-hooks-pink/10 rounded-xl p-4 border border-hooks-coral/20">
            <PlayCircle className="w-8 h-8 text-hooks-coral mb-2 mx-auto" />
            <h4 className="font-semibold text-gray-800 text-sm mb-1">Upload Videos</h4>
            <p className="text-xs text-gray-600">Behind-the-scenes, tutorials, stories</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Image className="w-8 h-8 text-gray-500 mb-2 mx-auto" />
            <h4 className="font-semibold text-gray-800 text-sm mb-1">Share Photos</h4>
            <p className="text-xs text-gray-600">Exclusive shots, previews, moments</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-hooks-coral" />
            <span>Higher engagement</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-hooks-pink" />
            <span>More followers</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-hooks-purple" />
            <span>Better monetization</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12 px-6">
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full"></div>
        </div>
        <div className="relative flex items-center justify-center">
          <Upload className="w-10 h-10 text-gray-400" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-600 mb-2">No exclusive content yet</h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        Follow creators to discover exclusive photos, videos, and behind-the-scenes content
      </p>
    </div>
  );
};

export default ExclusiveContentEmptyState;
