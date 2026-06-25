import React, { useEffect, useState } from 'react';
import {
  Bus, Bell, User, MapPin, Calendar, Search,
  Ticket, Star, ChevronRight, CheckCircle2, ArrowLeftRight,
  AlertCircle, Tag, HeadphonesIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { getMyBookings } from '../api/bookings';

const Dashboard = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [searchError, setSearchError] = useState('');

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [totalTrips, setTotalTrips] = useState(0);
  const [upcomingTrips, setUpcomingTrips] = useState(0);
  const [completedTrips, setCompletedTrips] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const handleSearch = () => {
    if (!from || !to || !date) {
      setSearchError('Enter where you\u2019re leaving from, where you\u2019re going, and a date.');
      return;
    }
    setSearchError('');
    navigate(`/search?from=${from}&to=${to}&date=${date}`);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setUserLoading(false);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await getMyBookings();
        const bookings = res.data?.data || [];
        setTotalTrips(bookings.length);
        setUpcomingTrips(
          bookings.filter((b) => b.status?.toLowerCase() === 'confirmed').length
        );
        setCompletedTrips(
          bookings.filter((b) => b.status?.toLowerCase() === 'completed').length
        );
        setRecentBookings(bookings.slice(0, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setBookingsLoading(false);
      }
    };
    loadBookings();
  }, []);

  const firstName = user?.name?.split(' ')[0];

  const statusConfig = {
    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300' },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Bus size={18} className="text-white" strokeWidth={1.5} />
            </div>
            <span className="text-lg font-semibold text-gray-900 hidden sm:block">TicketDot</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {['Dashboard', 'My trips', 'Offers'].map((label) => (
              <button
                key={label}
                onClick={() => navigate(label === 'Dashboard' ? '/dashboard' : label === 'My trips' ? '/my-bookings' : '/offers')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  label === 'Dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={18} strokeWidth={1.5} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <User size={16} strokeWidth={1.5} />
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ml-1"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          {userLoading ? (
            <div className="h-8 w-64 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
          )}
          <p className="text-sm text-gray-500 mt-1">Where are we heading next?</p>
        </div>

        {/* Search Card */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 sm:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="w-full md:flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Leaving from..."
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    if (searchError) setSearchError('');
                  }}
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="hidden md:flex items-center justify-center pb-3 px-1 text-gray-300 hover:text-gray-600 transition-colors shrink-0"
            >
              <ArrowLeftRight size={16} strokeWidth={1.5} />
            </button>

            <div className="w-full md:flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Going to..."
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    if (searchError) setSearchError('');
                  }}
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="w-full md:w-44">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (searchError) setSearchError('');
                  }}
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-600 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="w-full md:w-auto h-11 px-6 rounded-xl bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/10"
            >
              <Search size={16} strokeWidth={1.5} />
              Search
            </button>
          </div>

          {searchError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={14} strokeWidth={1.5} />
              {searchError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                icon={Ticket}
                label="Total trips"
                value={totalTrips}
                loading={bookingsLoading}
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={CheckCircle2}
                label="Upcoming"
                value={upcomingTrips}
                loading={bookingsLoading}
                color="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                icon={Star}
                label="Completed"
                value={completedTrips}
                loading={bookingsLoading}
                color="bg-amber-50 text-amber-600"
              />
            </div>

            {/* Recent bookings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Recent bookings</h2>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
                >
                  View all
                  <ChevronRight size={14} strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-2">
                {bookingsLoading &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-20 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" />
                  ))}

                {!bookingsLoading &&
                  recentBookings.map((b) => {
                    const operatorName = b.operator_name || b.operator || 'Operator';
                    const busType = b.bus_type || b.type || '';
                    const seat = b.seat || b.seat_number || '-';
                    const fare = b.fare || b.amount || b.total_fare || 0;
                    const status = (b.status || 'confirmed').toLowerCase();
                    const cfg = statusConfig[status] || statusConfig.confirmed;
                    const bookedAt = b.booked_at || b.created_at || b.date;
                    const bookedAtLabel = bookedAt
                      ? new Date(bookedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : null;

                    return (
                      <div
                        key={b.booking_id || b.id}
                        className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                              <Bus size={16} className="text-gray-400" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {operatorName}
                                {busType ? ` \u00b7 ${busType}` : ''}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Seat {seat}
                                {bookedAtLabel ? ` \u00b7 ${bookedAtLabel}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-900">
                              \u20b9{Number(fare).toLocaleString('en-IN')}
                            </p>
                            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {!bookingsLoading && recentBookings.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-200 p-8 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                      <Ticket size={18} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">No trips booked yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">Search for a route to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Tag size={15} className="text-blue-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Offers</h3>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-gray-50 p-3.5">
                  <p className="text-sm font-medium text-gray-900">Flat \u20b9100 off</p>
                  <p className="text-xs text-gray-500 mt-0.5">On your next AC sleeper booking</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3.5">
                  <p className="text-sm font-medium text-gray-900">Free cancellation</p>
                  <p className="text-xs text-gray-500 mt-0.5">Valid for new routes this month</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/offers')}
                className="mt-4 w-full h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                View all offers
              </button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <HeadphonesIcon size={15} className="text-gray-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Need help?</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Reach our support team for booking changes, refunds, or live trip tracking.
              </p>
              <button className="mt-4 w-full h-10 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors">
                Contact support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, loading, color }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
      <Icon size={16} strokeWidth={1.5} />
    </div>
    {loading ? (
      <div className="h-6 w-8 bg-gray-100 rounded animate-pulse mb-1" />
    ) : (
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    )}
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
  </div>
);

export default Dashboard;