import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useRevenueAnalytics } from "@/hooks/useRevenueAnalytics";
import { DollarSign, TrendingUp } from "lucide-react";

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const RevenueCharts = () => {
  const { revenueBreakdown, monthlyTrend, totalRevenue, loading } = useRevenueAnalytics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading revenue data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format revenue breakdown for pie chart
  const pieData = revenueBreakdown.map((item) => ({
    name: item.source_type.charAt(0).toUpperCase() + item.source_type.slice(1),
    value: Number(item.total_amount),
    percentage: item.percentage,
  }));

  // Format monthly trend for line chart (reverse to show chronologically)
  const lineData = [...monthlyTrend].reverse().map((item) => ({
    month: item.month_label,
    revenue: Number(item.total_revenue),
    tips: Number(item.tips),
    subscriptions: Number(item.subscriptions),
    ppv: Number(item.ppv),
  }));

  return (
    <>
      {/* Total Revenue Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Platform Revenue</p>
              <h2 className="text-3xl font-bold">₦{totalRevenue.toLocaleString()}</h2>
              <p className="text-sm text-muted-foreground mt-1">All-time earnings</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold">₦{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} name="Total" />
                  <Line type="monotone" dataKey="tips" stroke="#ec4899" strokeWidth={2} name="Tips" />
                  <Line type="monotone" dataKey="subscriptions" stroke="#10b981" strokeWidth={2} name="Subscriptions" />
                  <Line type="monotone" dataKey="ppv" stroke="#f59e0b" strokeWidth={2} name="PPV" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
