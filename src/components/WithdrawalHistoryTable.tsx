
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Withdrawal } from "@/hooks/useWithdrawals";

interface WithdrawalHistoryTableProps {
  withdrawals: Withdrawal[];
  loading: boolean;
}

const WithdrawalHistoryTable = ({ withdrawals, loading }: WithdrawalHistoryTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading withdrawal history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal History</CardTitle>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No withdrawal requests yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Bank Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    {format(new Date(withdrawal.requested_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {withdrawal.amount} Keys
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{withdrawal.bank_name}</div>
                      <div className="text-gray-600">{withdrawal.account_number}</div>
                      <div className="text-gray-600">{withdrawal.account_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-white ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      {withdrawal.notes && (
                        <div className="text-gray-600">{withdrawal.notes}</div>
                      )}
                      {withdrawal.admin_notes && (
                        <div className="text-blue-600 font-medium">
                          Admin: {withdrawal.admin_notes}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default WithdrawalHistoryTable;
