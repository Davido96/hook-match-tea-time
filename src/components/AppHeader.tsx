
import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import NotificationDropdown from "./NotificationDropdown";

interface AppHeaderProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  title?: string;
}

const AppHeader = ({ onProfileClick, onSettingsClick, title = "Hooks" }: AppHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else if (user?.id) {
      navigate(`/profile/${user.id}`);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <h1 className="text-xl font-bold text-hooks-coral">{title}</h1>
      
      <div className="flex items-center space-x-2">
        <NotificationDropdown />
        
        {onSettingsClick && (
          <Button variant="ghost" size="sm" onClick={onSettingsClick}>
            <Settings className="w-5 h-5" />
          </Button>
        )}
        
        <Button variant="ghost" size="sm" onClick={handleProfileClick}>
          <User className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default AppHeader;
