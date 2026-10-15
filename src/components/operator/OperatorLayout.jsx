import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bus, Route, CalendarDays, Ticket,
  LogOut, Compass, ExternalLink, Menu, X, ChevronRight, User
} from 'lucide-react';
import { getCurrentUser } from '../../api/auth';

const NAV_ITEMS = [
  { label: 'Overview', path: '/operator/dashboard', icon: LayoutDashboard },
  { label: 'Fleet Buses', path: '/operator/buses', icon: Bus },
  { label: 'Routes', path: '/operator/routes', icon: Route },
  { label: 'Schedules', path: '/operator/schedules', icon: CalendarDays },
  { label: 'Bookings Manifest', path: '/operator/bookings', icon: Ticket },
];

const OperatorLayout = ({ title, subtitle, action, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem('user');
    if (cached) {
      try { setUser(JSON.parse(cached)); } catch (e) {}
    }
    getCurrentUser()
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/operator/buses' && location.pathname.startsWith('/operator/create-bus')) return true;
    if (path === '/operator/routes' && location.pathname.startsWith('/operator/create-route')) return true;
    if (path === '/operator/schedules' && location.pathname.startsWith('/operator/create-schedule')) return true;
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex font-sans antialiased">
      {/* Desktop Minimalist Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-zinc-200 shrink-0">
        {/* Brand & Workspace */}
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
              <Bus size={17} strokeWidth={2.2} />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 block">TicketDot</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Operator Workspace</span>
            </div>
          </div>

          <div className="mt-4 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/70 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-800 truncate">Shivneri Travels</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-zinc-500">Fleet Active</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700">PRO</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-zinc-100 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Compass size={15} />
              <span>Passenger View</span>
            </span>
            <ExternalLink size={12} className="text-zinc-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 truncate tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-zinc-500 truncate hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {action && <div>{action}</div>}
            <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 max-w-xs bg-white h-full flex flex-col p-5 shadow-2xl z-10">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <span className="font-bold text-sm text-zinc-900">Operator Workspace</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-zinc-400 hover:text-zinc-700">
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 py-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-zinc-100 space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-xs font-medium text-zinc-600 px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <Compass size={15} />
                    <span>Passenger View</span>
                  </span>
                  <ExternalLink size={12} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-xs font-medium text-red-600 px-3 py-2 flex items-center gap-2"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Body Canvas */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OperatorLayout;
