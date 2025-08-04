'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FiUsers, FiTrendingUp, FiActivity, FiCalendar, FiDownload } from 'react-icons/fi';
import { supabase } from '@/lib/supabaseClient';

interface AnalyticsData {
  totalUsers: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  totalMatches: number;
  totalProjects: number;
  signupTrend: { date: string; count: number }[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      // Get new users this month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString());

      // Get active users today (users who logged in today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: activeUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', today.toISOString());

      // Get total matches
      const { count: totalMatches } = await supabase
        .from('profile_matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'matched');

      // Get total projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Get signup trend for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: signupTrendData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Process signup trend data
      const signupTrend = processSignupTrend(signupTrendData || []);

      setData({
        totalUsers: totalUsers || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        activeUsersToday: activeUsersToday || 0,
        totalMatches: totalMatches || 0,
        totalProjects: totalProjects || 0,
        signupTrend,
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processSignupTrend = (data: any[]): { date: string; count: number }[] => {
    const dateCounts: { [key: string]: number } = {};
    
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    // Fill in missing dates with 0
    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dateCounts[dateStr] || 0,
      });
    }

    return result;
  };

  const exportData = () => {
    if (!data) return;
    
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Users', data.totalUsers],
      ['New Users This Week', data.newUsersThisWeek],
      ['New Users This Month', data.newUsersThisMonth],
      ['Active Users Today', data.activeUsersToday],
      ['Total Matches', data.totalMatches],
      ['Total Projects', data.totalProjects],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-white border border-border-light">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchAnalytics} variant="primary">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading text-text-primary">Analytics Dashboard</h1>
        <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
          <FiDownload className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-border-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Users</p>
                <p className="text-2xl font-heading text-text-primary">{data.totalUsers}</p>
              </div>
              <FiUsers className="w-8 h-8 text-accent-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">New This Week</p>
                <p className="text-2xl font-heading text-text-primary">{data.newUsersThisWeek}</p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Today</p>
                <p className="text-2xl font-heading text-text-primary">{data.activeUsersToday}</p>
              </div>
              <FiActivity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border-light">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Matches</p>
                <p className="text-2xl font-heading text-text-primary">{data.totalMatches}</p>
              </div>
              <FiCalendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border border-border-light">
          <CardHeader>
            <CardTitle className="text-lg font-heading text-text-primary">Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading text-text-primary">{data.newUsersThisMonth}</p>
            <p className="text-sm text-text-secondary">New users this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-border-light">
          <CardHeader>
            <CardTitle className="text-lg font-heading text-text-primary">Projects Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading text-text-primary">{data.totalProjects}</p>
            <p className="text-sm text-text-secondary">Total projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Signup Trend Chart */}
      <Card className="bg-white border border-border-light">
        <CardHeader>
          <CardTitle className="text-lg font-heading text-text-primary">Signup Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-1">
            {data.signupTrend.map((day, index) => (
              <div
                key={day.date}
                className="flex-1 bg-accent-primary rounded-t"
                style={{
                  height: `${Math.max((day.count / Math.max(...data.signupTrend.map(d => d.count))) * 200, 4)}px`,
                }}
                title={`${day.date}: ${day.count} signups`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-text-secondary mt-2">
            <span>{data.signupTrend[0]?.date}</span>
            <span>{data.signupTrend[data.signupTrend.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 