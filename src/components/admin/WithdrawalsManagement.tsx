import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";

interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  requested_at: string;
  processed_at?: string;
  notes?: string;
  admin_notes?: string;
  user_profile?: {
    name: string;
  };
}

export const WithdrawalsManagement = () => {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      let query = supabase
        .from('withdrawals')
        .select('*')
        .order('requested_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: withdrawalsData, error } = await query;
      if (error) throw error;

      // Fetch user profiles separately
      const userIds = withdrawalsData?.map(w => w.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      // Merge the data
      const enrichedWithdrawals = withdrawalsData?.map(withdrawal => ({
        ...withdrawal,
        user_profile: profilesData?.find(p => p.user_id === withdrawal.user_id)
      }));

      setWithdrawals(enrichedWithdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch withdrawals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (id: string, status: string, notes?: string) => {
    setUpdating(true);
    try {
      const updateData: any = {
        status,
        admin_notes: notes,
      };

      if (status === 'processed' || status === 'rejected') {
        updateData.processed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Send notification to user
      const withdrawal = withdrawals.find(w => w.id === id);
      if (withdrawal) {
        await supabase.from('notifications').insert({
          user_id: withdrawal.user_id,
          type: status === 'processed' ? 'withdrawal_processed' : 'withdrawal_rejected',
          title: status === 'processed' ? 'Withdrawal Processed' : 'Withdrawal Rejected',
          message: status === 'processed' 
            ? `Your withdrawal request of ${withdrawal.amount} Keys has been processed.`
            : `Your withdrawal request has been rejected. ${notes || ''}`,
          data: { withdrawal_id: id, amount: withdrawal.amount, reason: notes }
        });
      }

      toast({
        title: "Success",
        description: `Withdrawal ${status}`,
      });

      fetchWithdrawals();
      setSelectedWithdrawal(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to update withdrawal",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div>Loading withdrawals...</div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Withdrawal Requests</CardTitle>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedWithdrawal?.id === withdrawal.id ? 'border-hooks-coral bg-coral-50' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedWithdrawal(withdrawal)}
                >
                  <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{withdrawal.user_profile?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(withdrawal.requested_at), 'PPP')}
                      </p>
                    </div>
                    <Badge className={getStatusColor(withdrawal.status)}>
                      {getStatusIcon(withdrawal.status)}
                      <span className="ml-1 capitalize">{withdrawal.status}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{withdrawal.amount} Keys</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        {selectedWithdrawal ? (
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">User</h4>
                <p className="text-sm">{selectedWithdrawal.user_profile?.name || 'Unknown User'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Amount</h4>
                <p className="text-sm font-semibold">{selectedWithdrawal.amount} Keys</p>
              </div>

              <div>
                <h4 className="font-medium mb-1">Bank Details</h4>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Bank:</span> {selectedWithdrawal.bank_name}</p>
                  <p><span className="font-medium">Account:</span> {selectedWithdrawal.account_number}</p>
                  <p><span className="font-medium">Name:</span> {selectedWithdrawal.account_name}</p>
                </div>
              </div>

              {selectedWithdrawal.notes && (
                <div>
                  <h4 className="font-medium mb-1">User Notes</h4>
                  <p className="text-sm">{selectedWithdrawal.notes}</p>
                </div>
              )}

              {selectedWithdrawal.admin_notes && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-1">Admin Notes</h4>
                  <p className="text-sm">{selectedWithdrawal.admin_notes}</p>
                </div>
              )}

              {selectedWithdrawal.status === 'pending' && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">Admin Notes (Optional)</h4>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this withdrawal..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateWithdrawalStatus(selectedWithdrawal.id, 'processed', adminNotes)}
                      disabled={updating}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateWithdrawalStatus(selectedWithdrawal.id, 'rejected', adminNotes)}
                      disabled={updating}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Select a withdrawal request to view details
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
