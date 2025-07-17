import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AccountStats = () => {
  const [dashboardAnalytics, setDashboardAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccountStats = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Load dashboard analytics
        const { data: analytics } = await supabase
          .from('dashboard_analytics')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        // If no analytics exist yet, create initial record with member_since date
        let finalAnalytics = analytics;
        if (!analytics) {
          const { data: userAccount } = await supabase
            .from('User_accounts')
            .select('created_at')
            .eq('user_id', currentUser.id)
            .single();
          
          const memberSince = userAccount?.created_at ? new Date(userAccount.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          
          const { data: newAnalytics } = await supabase
            .from('dashboard_analytics')
            .insert({
              user_id: currentUser.id,
              member_since: memberSince
            })
            .select()
            .single();
          
          finalAnalytics = newAnalytics;
        }

        setDashboardAnalytics(finalAnalytics);
        setLoading(false);
      } catch (error) {
        console.error('Error loading account stats:', error);
        setLoading(false);
      }
    };

    loadAccountStats();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-black">Account Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-black/80 text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-blue-500/30 hover:from-blue-500/25 hover:to-cyan-500/25 transition-all duration-300 card-entrance">
      <CardHeader>
        <CardTitle className="text-black">Account Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-black/80">Sessions Completed:</span>
          <span className="font-bold text-black">{dashboardAnalytics?.total_sessions || 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-black/80">Average Score:</span>
          <span className="font-bold text-black">
            {dashboardAnalytics?.average_score ? `${Math.round(dashboardAnalytics.average_score)}%` : "0%"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-black/80">Hours Practiced:</span>
          <span className="font-bold text-black">
            {dashboardAnalytics?.hours_practiced ? dashboardAnalytics.hours_practiced.toFixed(1) : "0.0"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-black/80">Member Since:</span>
          <span className="font-bold text-black">
            {dashboardAnalytics?.member_since 
              ? new Date(dashboardAnalytics.member_since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
              : "Recently"
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
};