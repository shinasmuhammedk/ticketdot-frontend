import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus, Route, CalendarDays, Ticket, Users, IndianRupee,
  Plus, ArrowRight, TrendingUp, RefreshCw, BarChart2,
  Percent, ArrowUpRight
} from 'lucide-react';
import { getDashboardStats, getAnalytics } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';
import RevenueTimelineChart from '../../components/operator/RevenueTimelineChart';
import RouteFleetAnalytics from '../../components/operator/RouteFleetAnalytics';

const OperatorDashboard = () => {
  const [statsData, setStatsData] = useState({
    total_buses: 0,
    total_routes: 0,
    total_schedules: 0,
    total_bookings: 0,
    total_revenue: 0,
  });
  const [analyticsData, setAnalyticsData] = useState({
    period_days: 7,
    total_revenue: 0,
    total_tickets_sold: 0,
    average_ticket_price: 0,
    daily_revenue: [],
    route_occupancy: [],
    bus_utilization: [],
  });
  const [period, setPeriod] = useState('7d');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch overall stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      if (res.data?.data) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch analytics for period
  const fetchAnalyticsData = useCallback(async (selectedPeriod) => {
    setLoadingAnalytics(true);
    try {
      const res = await getAnalytics(selectedPeriod);
      if (res.data?.data) {
        setAnalyticsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Load analytics when period changes
  useEffect(() => {
    fetchAnalyticsData(period);
  }, [period, fetchAnalyticsData]);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchAnalyticsData(period)]);
    setIsRefreshing(false);
  };

  const topKPIs = [
    {
      label: 'Active Buses',
      value: loadingStats ? '—' : String(statsData.total_buses),
      desc: 'Fleet vehicles',
      icon: Bus,
      path: '/operator/buses',
    },
    {
      label: 'Active Routes',
      value: loadingStats ? '—' : String(statsData.total_routes),
      desc: 'City corridors',
      icon: Route,
      path: '/operator/routes',
    },
    {
      label: 'Trip Schedules',
      value: loadingStats ? '—' : String(statsData.total_schedules),
      desc: 'Departures logged',
      icon: CalendarDays,
      path: '/operator/schedules',
    },
    {
      label: 'Total Bookings',
      value: loadingStats ? '—' : String(statsData.total_bookings),
      desc: 'Passenger reservations',
      icon: Users,
      path: '/operator/bookings',
    },
    {
      label: 'Lifetime Revenue',
      value: loadingStats ? '—' : `₹${Number(statsData.total_revenue || 0).toLocaleString('en-IN')}`,
      desc: 'All-time gross earnings',
      icon: IndianRupee,
      path: '/operator/bookings',
    },
  ];

  const quickActions = [
    {
      title: 'Register Bus',
      desc: 'Add vehicle to fleet & configure physical seat layout',
      path: '/operator/create-bus',
      icon: Bus,
    },
    {
      title: 'Create Route',
      desc: 'Connect origin and destination cities in network',
      path: '/operator/create-route',
      icon: Route,
    },
    {
      title: 'Schedule Trip',
      desc: 'Set departure time and auto-populate seat inventory',
      path: '/operator/create-schedule',
      icon: CalendarDays,
    },
    {
      title: 'Passenger Manifest',
      desc: 'Review passenger contact info and seat allocations',
      path: '/operator/bookings',
      icon: Ticket,
    },
  ];

  return (
    <OperatorLayout
      title="Fleet Overview"
      subtitle="Real-time telemetry and schedule performance"
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/operator/create-schedule"
            className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>New Schedule</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Minimalist Top KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {topKPIs.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                to={s.path}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs transition-all group block"
              >
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {s.label}
                  </span>
                  <Icon size={15} className="group-hover:text-zinc-900 transition-colors" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-zinc-900">{s.value}</p>
                <p className="text-[11px] text-zinc-400 mt-1 font-medium">{s.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* Analytics Section Header & Period Switcher */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-zinc-700" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                  Revenue Intelligence & Occupancy
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Financial performance, ticket yields, and seat fill-rates for the chosen period
              </p>
            </div>

            {/* 7D vs 30D Period Switcher */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl self-start sm:self-auto border border-zinc-200/60">
              <button
                type="button"
                onClick={() => setPeriod('7d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === '7d'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => setPeriod('30d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === '30d'
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Period Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Period Revenue ({period === '7d' ? '7D' : '30D'})
                </span>
                <IndianRupee size={15} className="text-zinc-500" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-zinc-900">
                {loadingAnalytics ? '—' : `₹${Number(analyticsData.total_revenue || 0).toLocaleString('en-IN')}`}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                Confirmed bookings revenue
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Tickets Sold ({period === '7d' ? '7D' : '30D'})
                </span>
                <Ticket size={15} className="text-zinc-500" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-zinc-900">
                {loadingAnalytics ? '—' : analyticsData.total_tickets_sold}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                Confirmed passenger seats
              </p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-zinc-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Avg Ticket Yield
                </span>
                <Percent size={15} className="text-zinc-500" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-zinc-900">
                {loadingAnalytics ? '—' : `₹${Math.round(analyticsData.average_ticket_price || 0).toLocaleString('en-IN')}`}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                Average price realized per seat
              </p>
            </div>
          </div>

          {/* Visual SVG Timeline Chart */}
          <RevenueTimelineChart dailyData={analyticsData.daily_revenue} />

          {/* Route Occupancy & Fleet Utilization Breakdowns */}
          <RouteFleetAnalytics
            routeOccupancy={analyticsData.route_occupancy}
            busUtilization={analyticsData.bus_utilization}
          />
        </div>

        {/* Quick Management Suite */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link
                  key={qa.title}
                  to={qa.path}
                  className="bg-white p-5 rounded-2xl border border-zinc-200/80 hover:border-zinc-900 hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-900 group-hover:text-white transition-colors mb-3">
                      <Icon size={17} />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">{qa.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{qa.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-700 group-hover:text-zinc-900">
                    <span>Manage</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Live Operational Health Status */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-zinc-900">System Telemetry & Engine Active</p>
              <p className="text-[11px] text-zinc-400">PostgreSQL concurrency locking, live occupancy feeds, and background cleaners active.</p>
            </div>
          </div>
          <Link
            to="/operator/bookings"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 flex items-center gap-1 group"
          >
            <span>Review Live Passenger Manifest</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </OperatorLayout>
  );
};

export default OperatorDashboard;