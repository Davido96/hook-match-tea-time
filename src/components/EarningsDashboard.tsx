
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEarnings } from "@/hooks/useEarnings";
import { useWallet } from "@/hooks/useWallet";
import { useWithdrawals } from "@/hooks/useWithdrawals";
import { DollarSign, TrendingUp, Users, Gift, Wallet, Plus, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import UnifiedWalletModal from "./UnifiedWalletModal";
import WithdrawalHistoryTable from "./WithdrawalHistoryTable";

const EarningsDashboard = () => {
  const { summary, earnings, loading } = useEarnings();
  const { wallet } = useWallet();
  const { withdrawals, withdrawalsLoading, getPendingWithdrawals, convertKeysToNaira, MINIMUM_WITHDRAWAL } = useWithdrawals();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletModalTab, setWalletModalTab] = useState<"purchase" | "withdraw">("purchase");

  if (loading) {
    return <div className="text-center py-8">Loading earnings data...</div>;
  }

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'subscription':
        return <Users className="w-4 h-4" />;
      case 'tip':
        return <Gift className="w-4 h-4" />;
      case 'bonus':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'subscription':
        return 'bg-blue-500';
      case 'tip':
        return 'bg-green-500';
      case 'bonus':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const pendingWithdrawals = getPendingWithdrawals();

  const openWalletModal = (tab: "purchase" | "withdraw") => {
    setWalletModalTab(tab);
    setIsWalletModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallet?.keys_balance || 0} Keys</div>
            <p className="text-xs text-muted-foreground">₦{convertKeysToNaira(wallet?.keys_balance || 0).toLocaleString()} available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total || 0} Keys</div>
            <p className="text-xs text-muted-foreground">₦{convertKeysToNaira(summary?.total || 0).toLocaleString()} all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.subscription_earnings || 0} Keys</div>
            <p className="text-xs text-muted-foreground">From subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tips Received</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.tip_earnings || 0} Keys</div>
            <p className="text-xs text-muted-foreground">From tips</p>
          </CardContent>
        </Card>
      </div>

      {/* Unified Wallet Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Wallet Management</CardTitle>
              <CardDescription>Purchase Keys or withdraw your earnings</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => openWalletModal("purchase")}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Buy Keys
              </Button>
              <Button 
                onClick={() => openWalletModal("withdraw")}
                disabled={!wallet || wallet.keys_balance < MINIMUM_WITHDRAWAL}
                className="flex items-center gap-2 gradient-coral text-white"
              >
                <ArrowDown className="w-4 h-4" />
                Withdraw
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-hooks-coral to-hooks-pink text-white rounded-lg">
              <div className="text-sm opacity-90">Available Balance</div>
              <div className="text-2xl font-bold">{wallet?.keys_balance || 0} Keys</div>
              <div className="text-xs opacity-75">₦{convertKeysToNaira(wallet?.keys_balance || 0).toLocaleString()}</div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-700">Pending Withdrawals</div>
              <div className="text-2xl font-bold text-yellow-600">{pendingWithdrawals} Keys</div>
              <div className="text-xs text-yellow-600">₦{convertKeysToNaira(pendingWithdrawals).toLocaleString()}</div>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600">Minimum Withdrawal</div>
              <div className="text-2xl font-bold text-gray-600">{MINIMUM_WITHDRAWAL} Keys</div>
              <div className="text-xs text-gray-600">₦{convertKeysToNaira(MINIMUM_WITHDRAWAL).toLocaleString()}</div>
            </div>
          </div>
          
          {wallet && wallet.keys_balance < MINIMUM_WITHDRAWAL && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You need at least {MINIMUM_WITHDRAWAL} Keys to request a withdrawal. Keep earning to reach the minimum!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Earnings</CardTitle>
          <CardDescription>Your latest income transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No earnings yet</p>
          ) : (
            <div className="space-y-4">
              {earnings.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full text-white ${getSourceColor(earning.source_type)}`}>
                      {getSourceIcon(earning.source_type)}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{earning.source_type}</p>
                      {earning.description && (
                        <p className="text-sm text-gray-600">{earning.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {format(new Date(earning.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="font-bold">
                      +{earning.amount} Keys
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      ₦{convertKeysToNaira(earning.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <WithdrawalHistoryTable 
        withdrawals={withdrawals} 
        loading={withdrawalsLoading} 
      />

      {/* Unified Wallet Modal */}
      <UnifiedWalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        defaultTab={walletModalTab}
      />
    </div>
  );
};

export default EarningsDashboard;
