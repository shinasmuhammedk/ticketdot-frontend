import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bus, User, LogOut, Ticket, Compass, LayoutDashboard, ChevronDown } from 'lucide-react';
import { getCurrentUser } from '../api/auth';
import api from '../api/axiosInstance';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try {
      const cachedUser = localStorage.getItem('user');
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch {
      return null;
    }
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Refresh user from API
    getCurrentUser()
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        // Ignored
      });
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch {
      // Ignored
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-2xs group-hover:bg-zinc-800 transition-colors">
            <Bus size={17} strokeWidth={2.2} />
          </div>
          <span className="text-base font-bold tracking-tight text-zinc-900">
            TicketDot
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isActive('/dashboard') || isActive('/search')
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Compass size={14} />
            <span>Explore Buses</span>
          </Link>

          <Link
            to="/my-bookings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isActive('/my-bookings')
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Ticket size={14} />
            <span>My Bookings</span>
          </Link>

          {user?.role === 'operator_admin' && (
            <Link
              to="/operator/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
            >
              <LayoutDashboard size={13} />
              <span>Operator Portal</span>
            </Link>
          )}
        </nav>

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={13} />}
            </div>
            <span className="text-xs font-semibold text-zinc-800 hidden sm:inline-block max-w-[120px] truncate">
              {user?.name || 'Account'}
            </span>
            <ChevronDown size={13} className="text-zinc-400" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-zinc-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3.5 py-2.5 border-b border-zinc-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Signed in</p>
                  <p className="text-xs font-bold text-zinc-900 truncate mt-0.5">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors"
                  >
                    <User size={14} className="text-zinc-400" />
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-zinc-700 hover:bg-zinc-50 font-medium transition-colors"
                  >
                    <Ticket size={14} className="text-zinc-400" />
                    <span>My Bookings</span>
                  </Link>
                  {user?.role === 'operator_admin' && (
                    <Link
                      to="/operator/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-zinc-900 font-semibold hover:bg-zinc-50 transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-zinc-500" />
                      <span>Operator Portal</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-zinc-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 transition-colors font-semibold cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
