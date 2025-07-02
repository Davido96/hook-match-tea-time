import { Button } from "@/components/ui/button";
import { Bell, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProfileButton from "./ProfileButton";
import HookLogo from "./HookLogo";

interface AppHeaderProps {
  onProfileClick?: () => void;
  onWalletClick?: () => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
}
import ReferralButton from "./ReferralButton";

const AppHeader = ({ 
  onProfileClick, 
  onWalletClick, 
  onNotificationClick,
  unreadCount = 0 
}: AppHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <HookLogo className="w-8 h-8" />
          <span className="text-xl font-bold text-gray-900">Hook</span>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-2">
          <ReferralButton />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onWalletClick}
            className="text-gray-700 hover:text-hooks-coral"
          >
            <Wallet className="w-5 h-5" />
            <span className="sr-only">Wallet</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNotificationClick}
            className="relative text-gray-700 hover:text-hooks-coral"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 min-w-[16px] h-4 rounded-full"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          <ProfileButton onEditProfile={onProfileClick} />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
