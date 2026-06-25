import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bus,
  Route,
  CalendarDays,
  Ticket,
  ChevronRight,
  LayoutDashboard,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  IndianRupee,
  Activity,
  Plus,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/operator' },
  { label: 'Fleet', icon: Bus, path: '/operator/buses' },
  { label: 'Routes', icon: Route, path: '/operator/routes' },
  { label: 'Schedules', icon: CalendarDays, path: '/operator/schedules' },
  { label: 'Bookings', icon: Ticket, path: '/operator/bookings' },
];

const stats = [
  {
    label: 'Active buses',
    value: '24',
    delta: '+2 this week',
    trend: 'up',
    icon: Bus,
  },
  {
    label: 'Live routes',
    value: '12',
    delta: 'No change',
    trend: 'flat',
    icon: Route,
  },
  {
    label: "Today's bookings",
    value: '186',
    delta: '+18% vs yesterday',
    trend: 'up',
    icon: Users,
  },
  {
    label: "Today's revenue",
    value: '₹94,200',
    delta: '+₹12,400 vs yesterday',
    trend: 'up',
    icon: IndianRupee,
  },
];

const actions = [
  {
    title: 'Add a bus',
    description: 'Register a new vehicle to your fleet with seat layout and amenities.',
    icon: Bus,
    path: '/operator/create-bus',
    accent: 'bg-[#101F33]',
  },
  {
    title: 'Add a route',
    description: 'Define a source, destination, and the stops in between.',
    icon: Route,
    path: '/operator/create-route',
    accent: 'bg-[#101F33]',
  },
  {
    title: 'Create schedule',
    description: 'Set departure times and assign a bus to a route.',
    icon: CalendarDays,
    path: '/operator/create-schedule',
    accent: 'bg-[#101F33]',
  },
  {
    title: 'View bookings',
    description: 'Look up passenger bookings, seats, and payment status.',
    icon: Ticket,
    path: '/operator/bookings',
    accent: 'bg-[#101F33]',
  },
];

const recentActivity = [
  { text: 'Bus KA-09-4521 assigned to Bengaluru – Chennai, 22:30', time: '12m ago' },
  { text: 'New booking · 4 seats · Mumbai – Pune route', time: '34m ago' },
  { text: 'Schedule updated for Hyderabad – Vijayawada, 06:00 departure', time: '1h ago' },
  { text: 'Route Coimbatore – Kochi marked active', time: '3h ago' },
];

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#101F33] text-white shrink-0">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#E8A33D]">
            <Bus size={16} className="text-[#101F33]" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">TicketDot</span>
          <span className="text-[11px] text-white/40 font-medium ml-auto">Operator</span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[14px] font-medium transition-colors
                  ${active
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={17} strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Settings size={17} strokeWidth={2} />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 h-10 rounded-lg text-[14px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={17} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-stone-200 h-16 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#101F33]">
              <Bus size={14} className="text-[#E8A33D]" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-stone-900">
              TicketDot
            </span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-[17px] font-semibold text-stone-900">Overview</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500 hidden sm:block">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <div className="w-9 h-9 rounded-full bg-[#101F33] text-white flex items-center justify-center text-[13px] font-medium">
              OP
            </div>
          </div>
        </header>

        <main className="px-6 lg:px-8 py-8 max-w-7xl">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-stone-900">
              Good to see you back
            </h2>
            <p className="text-stone-500 mt-1 text-[15px]">
              Here's how your fleet is performing today.
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-stone-200 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] font-medium text-stone-500">
                      {stat.label}
                    </span>
                    <Icon size={16} className="text-stone-400" />
                  </div>
                  <div className="text-[26px] font-semibold text-stone-900 font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div
                    className={`mt-1.5 text-[12.5px] flex items-center gap-1
                      ${stat.trend === 'up' ? 'text-emerald-600' : 'text-stone-400'}`}
                  >
                    {stat.trend === 'up' && <TrendingUp size={12} />}
                    {stat.delta}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick actions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-stone-900">Quick actions</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.title}
                      onClick={() => navigate(action.path)}
                      className="group text-left bg-white rounded-xl border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-lg ${action.accent} flex items-center justify-center`}>
                          <Icon size={18} className="text-white" strokeWidth={2} />
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                      <h4 className="mt-4 text-[15px] font-semibold text-stone-900">
                        {action.title}
                      </h4>
                      <p className="mt-1 text-[13.5px] text-stone-500 leading-relaxed">
                        {action.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-stone-900">Recent activity</h3>
                <Activity size={15} className="text-stone-400" />
              </div>
              <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
                {recentActivity.map((item, i) => (
                  <div key={i} className="px-4 py-3.5">
                    <p className="text-[13.5px] text-stone-700 leading-snug">{item.text}</p>
                    <p className="text-[12px] text-stone-400 mt-1">{item.time}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/operator/create-route')}
                className="mt-4 w-full h-11 rounded-xl border border-dashed border-stone-300 text-stone-500 text-[13.5px] font-medium flex items-center justify-center gap-2 hover:border-stone-400 hover:text-stone-700 transition-colors"
              >
                <Plus size={15} />
                Add a new route
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OperatorDashboard;