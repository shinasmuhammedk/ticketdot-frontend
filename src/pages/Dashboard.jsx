import React, { useEffect, useState } from 'react';
import {
    Bus, Bell, User, MapPin, Calendar, Search,
    Ticket, Star, Clock, ChevronRight, CheckCircle2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api/auth';
import { getMyBookings } from '../api/bookings';


const Dashboard = () => {

    const navigate = useNavigate();

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');


    const handleSearch = () => {
        if (!from || !to || !date) {
            alert('Please enter from, to and date');
            return;
        }

        navigate(`/search?from=${from}&to=${to}&date=${date}`);
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const [user, setUser] = useState(null);

    // Stats state
    const [totalTrips, setTotalTrips] = useState(0);
    const [upcomingTrips, setUpcomingTrips] = useState(0);
    const [completedTrips, setCompletedTrips] = useState(0);
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await getCurrentUser();
                console.log("ME RESPONSE:", res.data);
                setUser(res.data.user);
            } catch (err) {
                console.error(err);
            }
        };
        loadUser();
    }, []);

    // Fetch bookings for dashboard stats
    useEffect(() => {
        const loadBookings = async () => {
            try {
                const res = await getMyBookings();
                console.log("DASHBOARD BOOKINGS RESPONSE:", res.data);
                const bookings = res.data?.data || [];

                setTotalTrips(bookings.length);

                setUpcomingTrips(
                    bookings.filter(
                        b => b.status?.toLowerCase() === 'confirmed'
                    ).length
                );

                setCompletedTrips(
                    bookings.filter(
                        b => b.status?.toLowerCase() === 'completed'
                    ).length
                );

                setRecentBookings(bookings.slice(0, 2));
                setCompletedTrips(
                    bookings.filter(b => b.status === 'completed').length
                );
                setRecentBookings(bookings.slice(0, 2));
            } catch (err) {
                console.error(err);
            }
        };
        loadBookings();
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#101F33]">
                                <Bus size={18} className="text-[#E8A33D]" strokeWidth={2.25} />
                            </div>
                            <span className="text-xl font-semibold tracking-tight text-[#101F33]">
                                TicketDot
                            </span>
                        </div>

                        <nav className="hidden md:flex gap-8 text-sm font-medium text-stone-600">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="text-[#101F33]"
                            >
                                Dashboard
                            </button>
                            <button onClick={() => navigate('/my-bookings')}>
                                My Trips
                            </button>
                            <a href="#" className="hover:text-[#101F33] transition-colors">Offers</a>
                        </nav>

                        <div className="flex items-center gap-4 text-stone-500">
                            <button className="hover:text-[#101F33] transition-colors">
                                <Bell size={20} />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[#101F33] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#E8A33D] transition-all">
                                <User size={18} />
                            </div>
                            <button onClick={handleLogout} className="text-sm font-medium text-[#101F33] hover:text-[#E8A33D] transition-colors ml-4">Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative bg-[#101F33] pt-12 pb-32 overflow-hidden">
                {/* Texture */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                        Welcome back, {user?.name || 'Traveler'}!
                    </h1>
                    <p className="mt-2 text-white/70 text-lg">
                        Where are we heading next?
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-12">
                {/* Floating Search Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-6 sm:p-8 mb-10 border border-stone-100">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:flex-1 relative">
                            <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wider">From</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Leaving from..."
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-stone-200 bg-stone-50 text-[15px] focus:bg-white focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center pb-3 px-2">
                            <ArrowRight size={20} className="text-stone-300" />
                        </div>

                        <div className="w-full md:flex-1 relative">
                            <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wider">To</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="text"
                                    placeholder="Going to..."
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-stone-200 bg-stone-50 text-[15px] focus:bg-white focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-48 relative">
                            <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wider">Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-stone-200 bg-stone-50 text-[15px] text-stone-600 focus:bg-white focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSearch}
                            className="w-full md:w-auto h-12 px-8 rounded-xl bg-[#E8A33D] text-[#101F33] text-[15px] font-semibold flex items-center justify-center gap-2 hover:bg-[#d69536] transition-colors shadow-sm active:scale-[0.98]"
                        >
                            <Search size={18} />
                            Search Buses
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Ticket size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">{totalTrips}</p>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Total Trips</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">{upcomingTrips}</p>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Upcoming</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Star size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">{completedTrips}</p>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Completed</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">1,240</p>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Km Traveled</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold tracking-tight text-stone-900">Recent Bookings</h2>
                                <button
                                    onClick={() => navigate('/my-bookings')}
                                    className="text-sm font-medium text-[#101F33] hover:text-[#E8A33D] transition-colors flex items-center gap-1"
                                >
                                    View All <ChevronRight size={16} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {recentBookings.map((b) => {
                                    const operatorName = b.operator_name || b.operator || 'Operator';
                                    const busType = b.bus_type || b.type || '';
                                    const seat = b.seat || b.seat_number || '-';
                                    const fare = b.fare || b.amount || b.total_fare || 0;
                                    const status = b.status || 'confirmed';
                                    const bookedAt = b.booked_at || b.created_at || b.date;

                                    return (
                                        <div key={b.booking_id || b.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                                                        <Bus size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-stone-900 text-[17px]">
                                                            {operatorName}{busType ? ` – ${busType}` : ''}
                                                        </h3>
                                                        <p className="text-sm text-stone-500">Seat {seat}</p>
                                                        <p className="text-sm text-stone-500">Booked At: {new Date(bookedAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start md:items-end space-y-2">
                                                    <div className="text-lg font-bold text-stone-900">₹{fare}</div>
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-xs font-medium ${status.toLowerCase() === 'confirmed'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : status.toLowerCase() === 'completed'
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : 'bg-stone-200 text-stone-600'
                                                            }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {recentBookings.length === 0 && (
                                    <p className="text-stone-500">No recent bookings.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
