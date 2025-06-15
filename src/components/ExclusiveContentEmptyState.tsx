
import { Upload } from "lucide-react";

interface ExclusiveContentEmptyStateProps {
  userType?: string;
}

const ExclusiveContentEmptyState = ({ userType }: ExclusiveContentEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">No exclusive content yet</h3>
      <p className="text-gray-500">
        {userType === 'creator' 
          ? "Start sharing exclusive content with your subscribers"
          : "Follow creators to see their exclusive content"
        }
      </p>
    </div>
  );
};

export default ExclusiveContentEmptyState;
