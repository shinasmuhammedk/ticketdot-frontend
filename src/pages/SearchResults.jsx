import React, { useEffect, useState, useMemo } from 'react';
import {
  Bus, SlidersHorizontal, ArrowLeft, Calendar, ArrowUpDown, X, RotateCcw,
  Sparkles, Filter, ChevronDown
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { searchBuses } from '../api/buses';
import BusCard from '../components/BusCard';
import BusReviewsModal from '../components/BusReviewsModal';
import Navbar from '../components/Navbar';

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (6 AM – 12 PM)', min: 6, max: 12 },
  { id: 'afternoon', label: 'Afternoon (12 PM – 6 PM)', min: 12, max: 18 },
  { id: 'evening', label: 'Evening (6 PM – 12 AM)', min: 18, max: 24 },
  { id: 'night', label: 'Night (12 AM – 6 AM)', min: 0, max: 6 },
];

const BUS_TYPES = [
  { id: 'AC_SLEEPER', label: 'AC Sleeper' },
  { id: 'NON_AC_SLEEPER', label: 'Non-AC Sleeper' },
  { id: 'AC_SEATER', label: 'AC Seater' },
  { id: 'NON_AC_SEATER', label: 'Non-AC Seater' },
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters & Sorting state
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [sortBy, setSortBy] = useState('departure');
  const [selectedBusForReviews, setSelectedBusForReviews] = useState(null);

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

  const availableOperators = useMemo(() => {
    return Array.from(new Set(buses.map((b) => b.operator_name).filter(Boolean)));
  }, [buses]);

  const toggleFilter = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedTimeSlots([]);
    setSelectedBusTypes([]);
    setSelectedOperators([]);
    setSortBy('departure');
  };

  const activeFilterCount =
    selectedTimeSlots.length +
    selectedBusTypes.length +
    selectedOperators.length +
    (sortBy !== 'departure' ? 1 : 0);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      // Filter by time slot
      if (selectedTimeSlots.length > 0) {
        const depDate = new Date(bus.departure_time);
        const hour = depDate.getHours();
        const matchesAnySlot = selectedTimeSlots.some((slotId) => {
          const slot = TIME_SLOTS.find((s) => s.id === slotId);
          if (!slot) return false;
          return hour >= slot.min && hour < slot.max;
        });
        if (!matchesAnySlot) return false;
      }

      // Filter by bus type
      if (selectedBusTypes.length > 0) {
        const typeNormalized = (bus.bus_type || '').toUpperCase();
        if (!selectedBusTypes.includes(typeNormalized)) {
          return false;
        }
      }

      // Filter by operator
      if (selectedOperators.length > 0) {
        if (!selectedOperators.includes(bus.operator_name)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.base_fare_paise || a.base_fare || 0) - (b.base_fare_paise || b.base_fare || 0);
      if (sortBy === 'price_desc') return (b.base_fare_paise || b.base_fare || 0) - (a.base_fare_paise || a.base_fare || 0);
      // default: departure time
      return new Date(a.departure_time) - new Date(b.departure_time);
    });
  }, [buses, selectedTimeSlots, selectedBusTypes, selectedOperators, sortBy]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      {/* Route & Search Summary Strip */}
      <div className="bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
                title="Back to search"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  <span>{from}</span>
                  <span className="text-indigo-500 font-normal">→</span>
                  <span>{to}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{formatDate(date)}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-indigo-600 font-bold">{buses.length} buses found</span>
                </div>
              </div>
            </div>

            {/* Quick Sort Control */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
                <ArrowUpDown size={14} className="text-slate-400" />
                <span className="font-semibold text-slate-500">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="departure">Departure Time</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Filters Sidebar + Results List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Filters Sidebar */}
          <aside className="lg:col-span-1 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs sticky top-20">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter size={16} className="text-indigo-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-6 pt-5">
              {/* Departure Time Slots */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Departure Time
                </label>
                <div className="space-y-2.5">
                  {TIME_SLOTS.map((slot) => (
                    <label key={slot.id} className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedTimeSlots.includes(slot.id)}
                        onChange={() => toggleFilter(selectedTimeSlots, setSelectedTimeSlots, slot.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-slate-300"
                      />
                      <span>{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bus Type */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Bus Type
                </label>
                <div className="space-y-2.5">
                  {BUS_TYPES.map((type) => (
                    <label key={type.id} className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedBusTypes.includes(type.id)}
                        onChange={() => toggleFilter(selectedBusTypes, setSelectedBusTypes, type.id)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-slate-300"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Operators */}
              {availableOperators.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Bus Operators
                  </label>
                  <div className="space-y-2.5">
                    {availableOperators.map((op) => (
                      <label key={op} className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedOperators.includes(op)}
                          onChange={() => toggleFilter(selectedOperators, setSelectedOperators, op)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500/20 border-slate-300"
                        />
                        <span>{op}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right Bus Results List */}
          <section className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-800">Searching available buses...</p>
                <p className="text-xs text-slate-400 mt-1">Connecting to live operator inventories</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-3xl p-8 text-center border border-red-200">
                <p className="text-sm font-bold text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Bus size={30} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No buses match your criteria</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing some filters or searching for alternative travel dates.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBuses.map((bus) => (
                  <BusCard
                    key={bus.schedule_id}
                    scheduleID={bus.schedule_id}
                    busId={bus.bus_id}
                    operatorName={bus.operator_name}
                    busType={bus.bus_type}
                    departureTime={bus.departure_time}
                    arrivalTime={bus.arrival_time}
                    availableSeats={bus.available_seats}
                    fare={bus.base_fare_paise || bus.base_fare}
                    rating={bus.rating}
                    reviewCount={bus.review_count}
                    onOpenReviews={(b) => setSelectedBusForReviews(b)}
                  />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Bus Reviews & Ratings Modal */}
      {selectedBusForReviews && (
        <BusReviewsModal
          isOpen={Boolean(selectedBusForReviews)}
          onClose={() => setSelectedBusForReviews(null)}
          busId={selectedBusForReviews.busId}
          operatorName={selectedBusForReviews.operatorName}
          busType={selectedBusForReviews.busType}
        />
      )}
    </div>
  );
};

export default SearchResults;