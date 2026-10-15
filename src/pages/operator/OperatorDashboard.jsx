import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus, Route, CalendarDays, Ticket, Users, IndianRupee,
  Plus, ArrowRight, ShieldCheck, TrendingUp
} from 'lucide-react';
import { getDashboardStats } from '../../api/operator';
import OperatorLayout from '../../components/operator/OperatorLayout';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    total_buses: 0,
    total_routes: 0,
    total_schedules: 0,
    total_bookings: 0,
    total_revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        if (res.data?.data) {
          setStatsData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Active Buses',
      value: loading ? '—' : String(statsData.total_buses),
      desc: 'Fleet vehicles',
      icon: Bus,
      path: '/operator/buses',
    },
    {
      label: 'Active Routes',
      value: loading ? '—' : String(statsData.total_routes),
      desc: 'Connected city pairs',
      icon: Route,
      path: '/operator/routes',
    },
    {
      label: 'Trip Schedules',
      value: loading ? '—' : String(statsData.total_schedules),
      desc: 'Scheduled departures',
      icon: CalendarDays,
      path: '/operator/schedules',
    },
    {
      label: 'Passenger Bookings',
      value: loading ? '—' : String(statsData.total_bookings),
      desc: 'Total reserved seats',
      icon: Users,
      path: '/operator/bookings',
    },
    {
      label: 'Gross Revenue',
      value: loading ? '—' : `₹${Number(statsData.total_revenue || 0).toLocaleString('en-IN')}`,
      desc: 'Total earnings',
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
        <Link
          to="/operator/create-schedule"
          className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>New Schedule</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Minimalist KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {stats.map((s) => {
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
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-zinc-900">System Telemetry Operational</p>
              <p className="text-[11px] text-zinc-400">PostgreSQL concurrency locking and background lock cleaners active.</p>
            </div>
          </div>
          <Link
            to="/operator/bookings"
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 flex items-center gap-1"
          >
            <span>Review Live Manifest</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </OperatorLayout>
  );
};

export default OperatorDashboard;