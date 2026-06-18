import React, { useState } from 'react';
import {
    Bus, Bell, User, MapPin, Calendar, Search,
    Ticket, Star, Clock, ChevronRight, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';



const Dashboard = () => {

    const navigate = useNavigate();

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');


    const handleSearch = () => {
        navigate(
            `/search?from=${from}&to=${to}&date=${date}`
        );
    };


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
                            <a href="#" className="text-[#101F33]">Dashboard</a>
                            <a href="#" className="hover:text-[#101F33] transition-colors">My Trips</a>
                            <a href="#" className="hover:text-[#101F33] transition-colors">Offers</a>
                        </nav>

                        <div className="flex items-center gap-4 text-stone-500">
                            <button className="hover:text-[#101F33] transition-colors">
                                <Bell size={20} />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[#101F33] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#E8A33D] transition-all">
                                <User size={18} />
                            </div>
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
                        Welcome back, Alex!
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
                                    <p className="text-2xl font-bold text-stone-900">12</p>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Total Trips</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">1</p>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Upcoming</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Star size={20} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-stone-900">450</p>
                                    <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Reward Pts</p>
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
                                <a href="#" className="text-sm font-medium text-[#101F33] hover:text-[#E8A33D] transition-colors flex items-center gap-1">
                                    View All <ChevronRight size={16} />
                                </a>
                            </div>

                            <div className="flex flex-col gap-4">
                                {/* Upcoming Trip Card */}
                                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                                                <Bus size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wider">Upcoming</span>
                                                    <span className="text-sm text-stone-500">Oct 24, 2026</span>
                                                </div>
                                                <h3 className="font-semibold text-stone-900 text-[17px]">New York to Boston</h3>
                                                <p className="text-sm text-stone-500 mt-0.5">Greyhound Express • Seat 14A</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-stone-100 pt-3 md:pt-0">
                                            <div className="text-lg font-bold text-stone-900">$45.00</div>
                                            <button className="text-sm font-medium text-[#101F33] bg-stone-100 px-4 py-2 rounded-lg hover:bg-[#101F33] hover:text-white transition-colors mt-2">
                                                View Ticket
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Completed Trip Card */}
                                <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow opacity-75 hover:opacity-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center flex-shrink-0 text-stone-500">
                                                <Bus size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-600 uppercase tracking-wider">Completed</span>
                                                    <span className="text-sm text-stone-500">Sep 12, 2026</span>
                                                </div>
                                                <h3 className="font-semibold text-stone-900 text-[17px]">Philadelphia to New York</h3>
                                                <p className="text-sm text-stone-500 mt-0.5">Megabus Premium • Seat 4C</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-stone-100 pt-3 md:pt-0">
                                            <div className="text-lg font-bold text-stone-900">$28.50</div>
                                            <button className="text-sm font-medium text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors mt-2">
                                                Book Again
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Offers */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-gradient-to-br from-[#101F33] to-[#1a2d47] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                            <Star className="text-[#E8A33D] mb-4" size={28} />
                            <h3 className="text-xl font-semibold mb-2">Upgrade to Pro</h3>
                            <p className="text-sm text-white/70 mb-6 leading-relaxed">
                                Get zero cancellation fees, priority boarding, and double reward points on every trip.
                            </p>
                            <button className="w-full py-2.5 rounded-lg bg-[#E8A33D] text-[#101F33] font-semibold hover:bg-[#d69536] transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
