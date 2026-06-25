import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ChevronDown,
  Route,
  Bus,
  Clock,
  IndianRupee,
  Users,
} from 'lucide-react';
import { createSchedule } from '../../api/operator';

// Placeholder data — replace with real lookups (API or context) once available.
const ROUTES = [
  { id: '1', origin: 'Bengaluru', destination: 'Chennai' },
  { id: '2', origin: 'Mumbai', destination: 'Pune' },
  { id: '3', origin: 'Hyderabad', destination: 'Vijayawada' },
  { id: '4', origin: 'Coimbatore', destination: 'Kochi' },
];

const BUSES = [
  { id: '1', registration: 'KL-10-AV-6577', type: 'AC Sleeper', seats: 36 },
  { id: '2', registration: 'KA-09-4521', type: 'AC Seater', seats: 44 },
  { id: '3', registration: 'TN-22-BX-1190', type: 'Non-AC Sleeper', seats: 32 },
];

const SearchPicker = ({ label, value, onChange, items, renderItem, renderSelected, placeholder, icon: Icon, error }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const selected = items.find((i) => i.id === value);

  const results = items.filter((i) =>
    renderItem(i).searchText.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-invalid={Boolean(error)}
        className={`w-full h-12 px-4 rounded-xl border bg-white text-[15px] flex items-center justify-between outline-none transition-colors
          ${error
            ? 'border-red-300 focus:ring-4 focus:ring-red-50'
            : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
          }`}
      >
        <span className={`flex items-center gap-2 truncate ${selected ? 'text-stone-900' : 'text-stone-400'}`}>
          <Icon size={16} className={selected ? 'text-[#101F33]' : 'text-stone-400'} />
          {selected ? renderSelected(selected) : placeholder}
        </span>
        <ChevronDown size={16} className="text-stone-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-stone-200 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-stone-100">
            <Search size={15} className="text-stone-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 text-[14px] outline-none placeholder:text-stone-400"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {results.length === 0 && (
              <p className="px-4 py-3 text-[13.5px] text-stone-400">No results found</p>
            )}
            {results.map((item) => {
              const r = renderItem(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50 transition-colors
                    ${value === item.id ? 'bg-stone-50' : ''}`}
                >
                  <span className="text-[14px] text-stone-900">{r.primary}</span>
                  <span className="text-[12.5px] text-stone-400">{r.secondary}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const formatDuration = (start, end) => {
  if (!start || !end) return null;
  const diffMs = new Date(end) - new Date(start);
  if (diffMs <= 0) return null;
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.round((diffMs % 3600000) / 60000);
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
};

const CreateSchedule = () => {
  const [routeId, setRouteId] = useState('');
  const [busId, setBusId] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [baseFare, setBaseFare] = useState(450);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const selectedBus = BUSES.find((b) => b.id === busId);
  const duration = useMemo(
    () => formatDuration(departureTime, arrivalTime),
    [departureTime, arrivalTime]
  );

  // Default available seats to the bus's total capacity when a bus is selected
  useEffect(() => {
    if (selectedBus && !availableSeats) {
      setAvailableSeats(selectedBus.seats);
    }
  }, [selectedBus]);

  const toISOWithIndiaOffset = (value) => (value ? `${value}:00+05:30` : '');

  const validate = () => {
    const next = {};
    if (!routeId) next.routeId = 'Select a route';
    if (!busId) next.busId = 'Select a bus';
    if (!departureTime) next.departureTime = 'Set a departure time';
    if (!arrivalTime) next.arrivalTime = 'Set an arrival time';
    if (departureTime && arrivalTime && new Date(arrivalTime) <= new Date(departureTime)) {
      next.arrivalTime = 'Arrival must be after departure';
    }
    const seats = Number(availableSeats);
    if (!availableSeats || seats < 1) {
      next.availableSeats = 'Enter available seats';
    } else if (selectedBus && seats > selectedBus.seats) {
      next.availableSeats = `Cannot exceed bus capacity of ${selectedBus.seats}`;
    }
    if (!baseFare || Number(baseFare) < 1) next.baseFare = 'Enter a base fare';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setFieldErrors(validationErrors);
    setMessage('');
    setError('');
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await createSchedule({
        route_id: routeId,
        bus_id: busId,
        departure_time: toISOWithIndiaOffset(departureTime),
        arrival_time: toISOWithIndiaOffset(arrivalTime),
        available_seats: Number(availableSeats),
        base_fare: Number(baseFare),
      });

      setMessage('Schedule created successfully');
      setRouteId('');
      setBusId('');
      setDepartureTime('');
      setArrivalTime('');
      setAvailableSeats('');
      setBaseFare(450);
      setFieldErrors({});
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to create schedule'
      );
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (key) => {
    if (fieldErrors[key]) setFieldErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-stone-200 h-16 flex items-center px-6 lg:px-8">
        <Link
          to="/operator/dashboard"
          className="flex items-center gap-2 text-[13.5px] font-medium text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Operator dashboard
        </Link>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#101F33] flex items-center justify-center">
            <CalendarDays size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Create schedule</h1>
        </div>
        <p className="text-stone-500 text-[15px] ml-12">
          Assign a bus to a route with departure and arrival times.
        </p>

        {message && (
          <div className="mt-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
            <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[14px] text-emerald-800 flex-1">{message}</p>
            <button onClick={() => setMessage('')} aria-label="Dismiss">
              <X size={16} className="text-emerald-600" />
            </button>
          </div>
        )}
        {error && (
          <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
            <AlertCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-[14px] text-red-700 flex-1">{error}</p>
            <button onClick={() => setError('')} aria-label="Dismiss">
              <X size={16} className="text-red-600" />
            </button>
          </div>
        )}

        <div className="mt-7 bg-white rounded-2xl border border-stone-200 p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Route & bus */}
            <div className="space-y-4">
              <p className="text-[12.5px] font-medium text-stone-400 uppercase tracking-wide">
                Route & vehicle
              </p>
              <SearchPicker
                label="Route"
                icon={Route}
                value={routeId}
                onChange={(id) => {
                  setRouteId(id);
                  clearFieldError('routeId');
                }}
                items={ROUTES}
                placeholder="Select a route"
                error={fieldErrors.routeId}
                renderItem={(r) => ({
                  primary: `${r.origin} \u2192 ${r.destination}`,
                  secondary: '',
                  searchText: `${r.origin} ${r.destination}`,
                })}
                renderSelected={(r) => `${r.origin} \u2192 ${r.destination}`}
              />

              <SearchPicker
                label="Bus"
                icon={Bus}
                value={busId}
                onChange={(id) => {
                  setBusId(id);
                  clearFieldError('busId');
                  setAvailableSeats('');
                }}
                items={BUSES}
                placeholder="Select a bus"
                error={fieldErrors.busId}
                renderItem={(b) => ({
                  primary: b.registration,
                  secondary: `${b.type} \u00b7 ${b.seats} seats`,
                  searchText: `${b.registration} ${b.type}`,
                })}
                renderSelected={(b) => `${b.registration} \u00b7 ${b.seats} seats`}
              />
            </div>

            {/* Timing */}
            <div className="space-y-4">
              <p className="text-[12.5px] font-medium text-stone-400 uppercase tracking-wide">
                Timing
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Departure
                  </label>
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => {
                      setDepartureTime(e.target.value);
                      clearFieldError('departureTime');
                      clearFieldError('arrivalTime');
                    }}
                    aria-invalid={Boolean(fieldErrors.departureTime)}
                    className={`w-full h-12 px-4 rounded-xl border bg-white text-[14.5px] outline-none transition-colors
                      ${fieldErrors.departureTime
                        ? 'border-red-300 focus:ring-4 focus:ring-red-50'
                        : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                      }`}
                  />
                  {fieldErrors.departureTime && (
                    <p className="mt-1.5 text-sm text-red-500">{fieldErrors.departureTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Arrival
                  </label>
                  <input
                    type="datetime-local"
                    value={arrivalTime}
                    onChange={(e) => {
                      setArrivalTime(e.target.value);
                      clearFieldError('arrivalTime');
                    }}
                    aria-invalid={Boolean(fieldErrors.arrivalTime)}
                    className={`w-full h-12 px-4 rounded-xl border bg-white text-[14.5px] outline-none transition-colors
                      ${fieldErrors.arrivalTime
                        ? 'border-red-300 focus:ring-4 focus:ring-red-50'
                        : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                      }`}
                  />
                  {fieldErrors.arrivalTime && (
                    <p className="mt-1.5 text-sm text-red-500">{fieldErrors.arrivalTime}</p>
                  )}
                </div>
              </div>

              {duration && (
                <div className="flex items-center gap-2 text-[13.5px] text-stone-500 bg-slate-50 rounded-lg px-3.5 py-2.5">
                  <Clock size={14} />
                  Trip duration: <span className="font-medium text-stone-700">{duration}</span>
                </div>
              )}
            </div>

            {/* Capacity & fare */}
            <div className="space-y-4">
              <p className="text-[12.5px] font-medium text-stone-400 uppercase tracking-wide">
                Capacity & fare
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Available seats
                  </label>
                  <div className="relative">
                    <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="number"
                      min="1"
                      max={selectedBus?.seats}
                      value={availableSeats}
                      onChange={(e) => {
                        setAvailableSeats(e.target.value);
                        clearFieldError('availableSeats');
                      }}
                      aria-invalid={Boolean(fieldErrors.availableSeats)}
                      className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-[14.5px] outline-none transition-colors
                        ${fieldErrors.availableSeats
                          ? 'border-red-300 focus:ring-4 focus:ring-red-50'
                          : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                        }`}
                    />
                  </div>
                  {fieldErrors.availableSeats ? (
                    <p className="mt-1.5 text-sm text-red-500">{fieldErrors.availableSeats}</p>
                  ) : selectedBus ? (
                    <p className="mt-1.5 text-[13px] text-stone-400">
                      Bus capacity: {selectedBus.seats} seats
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Base fare
                  </label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="number"
                      min="1"
                      value={baseFare}
                      onChange={(e) => {
                        setBaseFare(e.target.value);
                        clearFieldError('baseFare');
                      }}
                      aria-invalid={Boolean(fieldErrors.baseFare)}
                      className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-white text-[14.5px] outline-none transition-colors
                        ${fieldErrors.baseFare
                          ? 'border-red-300 focus:ring-4 focus:ring-red-50'
                          : 'border-stone-200 focus:border-[#101F33] focus:ring-4 focus:ring-[#101F33]/5'
                        }`}
                    />
                  </div>
                  {fieldErrors.baseFare && (
                    <p className="mt-1.5 text-sm text-red-500">{fieldErrors.baseFare}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#101F33] text-white font-medium transition-all hover:bg-[#1A2D47] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create schedule'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateSchedule;