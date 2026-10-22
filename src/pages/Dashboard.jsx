import React, { useEffect, useState } from 'react';
import {
  Bus, MapPin, Calendar, Search, Ticket, ArrowLeftRight,
  AlertCircle, ShieldCheck, Clock, Zap, Headphones, ChevronRight, CheckCircle2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { getMyBookings } from '../api/bookings';
import { getCities } from '../api/buses';
import { formatINR } from '../utils/formatINR';
import Navbar from '../components/Navbar';

const POPULAR_ROUTES = [
  { from: 'Mumbai', to: 'Pune', fare: '₹350' },
  { from: 'Bengaluru', to: 'Chennai', fare: '₹650' },
  { from: 'Hyderabad', to: 'Bengaluru', fare: '₹750' },
  { from: 'Delhi', to: 'Jaipur', fare: '₹450' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
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

  const [todayStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [tomorrowStr] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!from || !to || !date) {
      setSearchError('Please specify departure city, arrival destination, and travel date.');
      return;
    }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setSearchError('Origin and destination cannot be the same city.');
      return;
    }
    setSearchError('');
    navigate(`/search?from=${encodeURIComponent(from.trim())}&to=${encodeURIComponent(to.trim())}&date=${date}`);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const setQuickRoute = (rFrom, rTo) => {
    setFrom(rFrom);
    setTo(rTo);
    setDate(todayStr);
    setSearchError('');
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
    const loadCities = async () => {
      try {
        const res = await getCities();
        setCities(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load cities:', err);
      }
    };
    loadCities();
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
        setRecentBookings(bookings.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setBookingsLoading(false);
      }
    };
    loadBookings();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Traveler';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-6">
              <Zap size={14} className="text-amber-400" />
              <span>Instant Confirmation & Zero Booking Fees</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Where will your journey take you, <span className="bg-gradient-to-r from-indigo-300 to-blue-200 bg-clip-text text-transparent">{firstName}</span>?
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-normal">
              Book verified buses with real-time seat availability, transparent pricing, and instant e-tickets.
            </p>
          </div>
        </div>

        {/* Elevated Search Container */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-5 sm:p-7">
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                {/* From City */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Leaving From
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Bengaluru"
                      list="cities-list"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        if (searchError) setSearchError('');
                      }}
                      className="w-full h-12 pl-11 pr-3 rounded-xl border border-slate-200 bg-slate-50/60 font-semibold text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="hidden md:flex md:col-span-1 justify-center pt-5">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                    title="Swap locations"
                  >
                    <ArrowLeftRight size={16} />
                  </button>
                </div>

                {/* To City */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Going To
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="text"
                      placeholder="e.g. Pune, Chennai"
                      list="cities-list"
                      value={to}
                      onChange={(e) => {
                        setTo(e.target.value);
                        if (searchError) setSearchError('');
                      }}
                      className="w-full h-12 pl-11 pr-3 rounded-xl border border-slate-200 bg-slate-50/60 font-semibold text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Date Picker */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Date of Journey
                  </label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" />
                    <input
                      type="date"
                      value={date}
                      min={todayStr}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (searchError) setSearchError('');
                      }}
                      className="w-full h-12 pl-11 pr-3 rounded-xl border border-slate-200 bg-slate-50/60 font-semibold text-slate-900 text-sm focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Datalist for Verified Cities */}
              <datalist id="cities-list">
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.state ? `${c.name}, ${c.state}` : c.name}
                  </option>
                ))}
              </datalist>

              {/* Quick Date Shortcuts & Search Action */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400">Quick Date:</span>
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      date === todayStr ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(tomorrowStr)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      date === tomorrowStr ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tomorrow
                  </button>
                </div>

                <button
                  type="submit"
                  className="h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 active:scale-98 transition-all cursor-pointer"
                >
                  <Search size={18} strokeWidth={2.2} />
                  Find Buses
                </button>
              </div>

              {searchError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700 font-medium animate-in fade-in">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}
            </form>

            {/* Popular Verified Routes Pills */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Popular:</span>
              {POPULAR_ROUTES.map((r) => (
                <button
                  key={`${r.from}-${r.to}`}
                  type="button"
                  onClick={() => setQuickRoute(r.from, r.to)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-medium text-slate-700 hover:text-indigo-600 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{r.from}</span>
                  <span className="text-slate-400">→</span>
                  <span>{r.to}</span>
                  <span className="text-indigo-600 font-bold ml-1">{r.fare}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Trips & Activity Overview */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Ticket size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Trips</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{upcomingTrips}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Trips</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{completedTrips}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{totalTrips}</p>
              </div>
            </div>
          </div>

          {/* Recent Trips Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Quick access to your travel boarding passes</p>
              </div>
              <Link
                to="/my-bookings"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
              >
                View all bookings
                <ChevronRight size={14} />
              </Link>
            </div>

            {bookingsLoading ? (
              <div className="py-8 text-center text-slate-400 text-sm">Loading recent trips...</div>
            ) : recentBookings.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Ticket size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No trips booked yet</p>
                <p className="text-xs text-slate-400 mt-1">Search for a bus route above to book your first trip.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentBookings.map((b) => (
                  <div
                    key={b.booking_ref}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
                      <span className="font-mono font-bold text-slate-700">#{b.booking_ref}</span>
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {b.status}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 my-2">
                      <span>Seats:</span>
                      <span className="text-indigo-600 font-black">
                        {b.seats && b.seats.length > 0 ? b.seats.join(', ') : b.seat_number}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">
                        {formatINR(b.amount_paise ?? b.amount)}
                      </span>
                      <Link
                        to={`/ticket/${b.booking_ref}`}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:underline"
                      >
                        Boarding Pass →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Features Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center sm:text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">100% Secure Reservations</h3>
                <p className="text-xs text-slate-500 mt-1">Zero double-bookings with atomic seat locking and certified payments.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Real-Time Schedules</h3>
                <p className="text-xs text-slate-500 mt-1">Always up-to-date departure times and dynamic seat availability counters.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Headphones size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Instant Support</h3>
                <p className="text-xs text-slate-500 mt-1">24/7 dedicated support assistance for all your bus ticketing inquiries.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;