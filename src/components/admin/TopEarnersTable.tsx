import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRevenueAnalytics } from "@/hooks/useRevenueAnalytics";
import { Crown, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TopEarnersTable = () => {
  const { topEarners, loading } = useRevenueAnalytics();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading top earners...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Top Earners This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topEarners.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Tips</TableHead>
                <TableHead className="text-right">Subscriptions</TableHead>
                <TableHead className="text-right">PPV</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topEarners.map((earner, index) => (
                <TableRow key={earner.user_id}>
                  <TableCell className="font-medium">
                    {index === 0 && <span className="text-yellow-500">🥇</span>}
                    {index === 1 && <span className="text-gray-400">🥈</span>}
                    {index === 2 && <span className="text-orange-600">🥉</span>}
                    {index > 2 && <span className="text-muted-foreground">#{index + 1}</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={earner.avatar_url || ''} />
                        <AvatarFallback>{earner.creator_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{earner.creator_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={earner.user_type === 'creator' ? 'default' : 'secondary'}>
                      {earner.user_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₦{Number(earner.tips_earnings).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₦{Number(earner.subscription_earnings).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₦{Number(earner.ppv_earnings).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ₦{Number(earner.total_earnings).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No earnings data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
