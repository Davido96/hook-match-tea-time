import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RevenueBreakdown {
  source_type: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

interface TopEarner {
  user_id: string;
  creator_name: string;
  avatar_url: string | null;
  user_type: string;
  total_earnings: number;
  tips_earnings: number;
  subscription_earnings: number;
  ppv_earnings: number;
}

interface MonthlyRevenue {
  month_date: string;
  month_label: string;
  total_revenue: number;
  tips: number;
  subscriptions: number;
  ppv: number;
}

export const useRevenueAnalytics = (startDate?: string, endDate?: string) => {
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyRevenue[]>([]);
  const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchRevenueAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch revenue breakdown
      const { data: breakdown, error: breakdownError } = await supabase.rpc(
        'get_revenue_analytics',
        { start_date: startDate, end_date: endDate }
      );

      if (breakdownError) throw breakdownError;
      setRevenueBreakdown(breakdown || []);
      
      const total = breakdown?.reduce((sum, item) => sum + Number(item.total_amount), 0) || 0;
      setTotalRevenue(total);

      // Fetch monthly trend
      const { data: trend, error: trendError } = await supabase.rpc(
        'get_monthly_revenue_trend',
        { months_count: 6 }
      );

      if (trendError) throw trendError;
      setMonthlyTrend(trend || []);

      // Fetch top earners
      const { data: earners, error: earnersError } = await supabase.rpc(
        'get_top_earners',
        { period_days: 30, limit_count: 10 }
      );

      if (earnersError) throw earnersError;
      setTopEarners(earners || []);
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueAnalytics();
  }, [startDate, endDate]);

  return {
    revenueBreakdown,
    monthlyTrend,
    topEarners,
    totalRevenue,
    loading,
    refetch: fetchRevenueAnalytics,
  };
};
