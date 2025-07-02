
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Users } from "lucide-react";
import { useState } from "react";
import { useReferrals } from "@/hooks/useReferrals";
import ReferralDashboard from "./ReferralDashboard";

const ReferralButton = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const { referralStats, loading } = useReferrals();

  const hasEarnings = referralStats && referralStats.referral_earnings > 0;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDashboard(true)}
        className="relative flex items-center space-x-2 text-gray-700 hover:text-hooks-coral"
        disabled={loading}
      >
        <Gift className="w-5 h-5" />
        <span className="hidden sm:inline">Refer</span>
        
        {hasEarnings && (
          <Badge 
            variant="secondary" 
            className="absolute -top-1 -right-1 bg-hooks-coral text-white text-xs px-1 min-w-[16px] h-4 rounded-full"
          >
            {referralStats.successful_referrals}
          </Badge>
        )}
      </Button>

      <ReferralDashboard 
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />
    </>
  );
};

export default ReferralButton;
