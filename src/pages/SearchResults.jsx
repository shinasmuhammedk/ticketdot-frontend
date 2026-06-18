import { Bus, User, Bell, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import BusCard from '../components/BusCard';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { searchBuses } from '../api/buses';


const SearchResults = () => {

    const [searchParams] = useSearchParams();

    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const date = searchParams.get('date') || '';

    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const loadBuses = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await searchBuses({ from, to, date });
                console.log('BUS SEARCH RESPONSE:', res.data);

                setBuses(res.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Failed to load buses'
                );
            } finally {
                setLoading(false);
            }
        };

        if (from && to && date) {
            loadBuses();
        }
    }, [from, to, date]);

    return (
        <div className="min-h-screen bg-stone-50 font-sans flex flex-col">
            {/* Minimal Header */}
            <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/dashboard" className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#101F33]">
                                <Bus size={18} className="text-[#E8A33D]" strokeWidth={2.25} />
                            </div>
                            <span className="text-xl font-semibold tracking-tight text-[#101F33] hidden sm:block">
                                TicketDot
                            </span>
                        </Link>

                        <div className="flex items-center gap-4 text-stone-500">
                            <button className="hover:text-[#101F33] transition-colors">
                                <Bell size={20} />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[#101F33] cursor-pointer hover:ring-2 hover:ring-[#E8A33D] transition-all">
                                <User size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Summary Bar */}
            <div className="bg-[#101F33] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                                    {from} <span className="text-stone-400">→</span> {to}
                                </h1>
                                <p className="text-sm text-stone-400 mt-0.5">{date} • {buses.length} Buses Found</p>
                            </div>
                        </div>
                        <button className="h-10 px-5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2 md:w-auto w-fit">
                            Modify Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">

                {/* Filters Sidebar (Placeholder) */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-24">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-100">
                            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                                <SlidersHorizontal size={18} /> Filters
                            </h2>
                            <button className="text-xs font-medium text-stone-500 hover:text-[#101F33] uppercase tracking-wide">
                                Clear
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Dummy Filter Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-stone-900 mb-3">Departure Time</h3>
                                <div className="space-y-2.5">
                                    {['Morning (06:00 - 12:00)', 'Afternoon (12:00 - 18:00)', 'Evening (18:00 - 00:00)'].map(time => (
                                        <label key={time} className="flex items-center gap-2.5 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-[#101F33] focus:ring-[#101F33]/20" />
                                            <span className="text-sm text-stone-600">{time}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-stone-900 mb-3">Bus Operator</h3>
                                <div className="space-y-2.5">
                                    {['Greyhound Lines', 'Megabus Express', 'Peter Pan Bus', 'FlixBus'].map(op => (
                                        <label key={op} className="flex items-center gap-2.5 cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-[#101F33] focus:ring-[#101F33]/20" />
                                            <span className="text-sm text-stone-600">{op}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>


                {loading && <p className="text-stone-500">Loading buses...</p>}

                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && buses.length === 0 && (
                    <p className="text-stone-500">No buses found.</p>
                )}  


                {/* Results List */}
                <main className="flex-1 flex flex-col gap-4">
                    {buses.map(bus => (
                        <BusCard
                            key={bus.schedule_id}
                            scheduleID={bus.schedule_id}
                            operatorName={bus.operator_name}
                            busType={bus.bus_type}
                            departureTime={bus.departure_time}
                            arrivalTime={bus.arrival_time}
                            availableSeats={bus.available_seats}
                            fare={bus.base_fare}
                        />
                    ))}
                </main>
            </div>
        </div>
    );
};

export default SearchResults;
