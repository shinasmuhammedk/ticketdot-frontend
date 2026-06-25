import { Bus, User, Bell, SlidersHorizontal, ArrowLeft, Search, Calendar } from 'lucide-react';
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

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={18} strokeWidth={1.5} />
                        <span className="hidden sm:inline">Back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell size={18} strokeWidth={1.5} />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <User size={16} strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </header>

            {/* Search Summary */}
            <div className="border-b border-gray-100 bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                <Bus size={18} className="text-blue-600" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                    {from}
                                    <ArrowLeft size={14} className="text-gray-400 rotate-180" strokeWidth={1.5} />
                                    {to}
                                </h1>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                                    <Calendar size={12} strokeWidth={1.5} />
                                    {formatDate(date)}
                                    <span className="text-gray-300">·</span>
                                    {buses.length} bus{buses.length !== 1 ? 'es' : ''} found
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 w-fit"
                        >
                            <Search size={14} strokeWidth={1.5} />
                            Modify
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
                {/* Filters Sidebar */}
                <aside className="w-full lg:w-60 flex-shrink-0">
                    <div className="lg:sticky lg:top-20 space-y-4">
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal size={15} strokeWidth={1.5} />
                                    Filters
                                </h2>
                                <button className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                                    Clear
                                </button>
                            </div>

                            <div className="p-5 space-y-6">
                                <FilterSection title="Departure Time">
                                    {['Morning (6AM – 12PM)', 'Afternoon (12PM – 6PM)', 'Evening (6PM – 12AM)', 'Night (12AM – 6AM)'].map(time => (
                                        <label key={time} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500/20" />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{time}</span>
                                        </label>
                                    ))}
                                </FilterSection>

                                <FilterSection title="Bus Type">
                                    {['AC Sleeper', 'Non-AC Sleeper', 'Semi-Sleeper', 'Seater'].map(type => (
                                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500/20" />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{type}</span>
                                        </label>
                                    ))}
                                </FilterSection>

                                <FilterSection title="Operator">
                                    {['Acme Travels', 'Swift Bus', 'Royal Coaches', 'Express Lines'].map(op => (
                                        <label key={op} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500/20" />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{op}</span>
                                        </label>
                                    ))}
                                </FilterSection>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Results */}
                <main className="flex-1 min-w-0">
                    {/* Loading */}
                    {loading && (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-28 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && buses.length === 0 && (
                        <div className="flex flex-col items-center text-center py-16">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5">
                                <Search size={24} className="text-gray-400" strokeWidth={1.5} />
                            </div>
                            <p className="text-gray-900 font-medium text-base">No buses found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Try changing your search criteria.
                            </p>
                        </div>
                    )}

                    {/* Results List */}
                    {!loading && !error && buses.length > 0 && (
                        <div className="space-y-3">
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
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const FilterSection = ({ title, children }) => (
    <div>
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">{title}</h3>
        <div className="space-y-2.5">
            {children}
        </div>
    </div>
);

export default SearchResults;