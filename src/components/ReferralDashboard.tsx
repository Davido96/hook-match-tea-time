
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Share2, 
  Copy, 
  MessageCircle, 
  Users, 
  Gift, 
  Trophy,
  Calendar,
  ChevronRight
} from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { useProfile } from "@/hooks/useProfile";
import { format } from "date-fns";

interface ReferralDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralDashboard = ({ isOpen, onClose }: ReferralDashboardProps) => {
  const { profile } = useProfile();
  const { 
    referralCode, 
    referralStats, 
    referralHistory, 
    loading, 
    shareReferral,
    generateReferralLink,
    getRewardAmount 
  } = useReferrals();

  if (!isOpen || loading) return null;

  const nextMilestone = referralStats ? Math.ceil((referralStats.successful_referrals + 1) / 5) * 5 : 5;
  const progressToMilestone = referralStats ? (referralStats.successful_referrals % 5) / 5 * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Referral Program</CardTitle>
              <p className="text-gray-600 mt-1">Invite friends and earn Keys together!</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-4">
                <Users className="w-6 h-6 mx-auto mb-2 text-hooks-coral" />
                <div className="text-2xl font-bold">{referralStats?.total_referrals || 0}</div>
                <div className="text-sm text-gray-600">Total Invites</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <Trophy className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{referralStats?.successful_referrals || 0}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-4">
                <Gift className="w-6 h-6 mx-auto mb-2 text-hooks-pink" />
                <div className="text-2xl font-bold">{referralStats?.referral_earnings || 0}</div>
                <div className="text-sm text-gray-600">Keys Earned</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress to Next Milestone */}
          <Card className="bg-gradient-to-r from-hooks-coral/10 to-hooks-pink/10">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Next Milestone</span>
                <span className="text-sm text-gray-600">{referralStats?.successful_referrals || 0}/{nextMilestone}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-hooks-coral to-hooks-pink h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressToMilestone}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {5 - (referralStats?.successful_referrals || 0) % 5} more successful referrals to earn 500 bonus Keys!
              </p>
            </CardContent>
          </Card>

          {/* Referral Code & Sharing */}
          {referralCode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Referral Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-hooks-coral mb-1">{referralCode.code}</div>
                  <div className="text-sm text-gray-600">Share this code with friends</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => shareReferral('copy')}
                    className="flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => shareReferral('whatsapp')}
                    className="flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => shareReferral('twitter')}
                    className="flex items-center space-x-2"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Twitter</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reward Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reward Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold mb-2">As a {profile?.user_type === 'creator' ? 'Creator' : 'Fan'}:</div>
                  <div className="space-y-1">
                    <div>• Invite Fan: {getRewardAmount(profile?.user_type || 'consumer', 'consumer')} Keys</div>
                    <div>• Invite Creator: {getRewardAmount(profile?.user_type || 'consumer', 'creator')} Keys</div>
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-2">Bonus Rewards:</div>
                  <div className="space-y-1">
                    <div>• Every 5 referrals: +500 Keys</div>
                    <div>• Monthly leaderboard prizes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          {referralHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {referralHistory.slice(0, 5).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-hooks-coral/20 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-hooks-coral" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {referral.referee_profile?.name || 'New User'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(referral.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={referral.status === 'completed' ? 'default' : 'secondary'}
                          className="mb-1"
                        >
                          {referral.status}
                        </Badge>
                        {referral.status === 'completed' && (
                          <div className="text-sm font-medium text-hooks-coral">
                            +{referral.reward_amount} Keys
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralDashboard;
