import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Route,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ArrowLeftRight,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { createRoute } from '../../api/operator';

// Placeholder city list — replace with a real lookup (API or context) once available.
const CITIES = [
  { id: '1', name: 'Bengaluru', state: 'Karnataka' },
  { id: '2', name: 'Chennai', state: 'Tamil Nadu' },
  { id: '3', name: 'Hyderabad', state: 'Telangana' },
  { id: '4', name: 'Mumbai', state: 'Maharashtra' },
  { id: '5', name: 'Pune', state: 'Maharashtra' },
  { id: '6', name: 'Kochi', state: 'Kerala' },
  { id: '7', name: 'Coimbatore', state: 'Tamil Nadu' },
  { id: '8', name: 'Vijayawada', state: 'Andhra Pradesh' },
  { id: '9', name: 'Mangaluru', state: 'Karnataka' },
  { id: '10', name: 'Madurai', state: 'Tamil Nadu' },
];

const CityPicker = ({ label, value, onChange, placeholder, error }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  const selected = CITIES.find((c) => c.id === value);
  const results = CITIES.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex-1">
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
        <span className={`flex items-center gap-2 ${selected ? 'text-stone-900' : 'text-stone-400'}`}>
          <MapPin size={16} className={selected ? 'text-[#101F33]' : 'text-stone-400'} />
          {selected ? selected.name : placeholder}
        </span>
        <ChevronDown size={16} className="text-stone-400" />
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
              placeholder="Search cities"
              className="flex-1 text-[14px] outline-none placeholder:text-stone-400"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {results.length === 0 && (
              <p className="px-4 py-3 text-[13.5px] text-stone-400">No cities found</p>
            )}
            {results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                  setQuery('');
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[14px] hover:bg-stone-50 transition-colors
                  ${value === c.id ? 'bg-stone-50' : ''}`}
              >
                <span className="text-stone-900">{c.name}</span>
                <span className="text-stone-400 text-[12.5px]">{c.state}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const CreateRoute = () => {
  const [originCityId, setOriginCityId] = useState('');
  const [destinationCityId, setDestinationCityId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!originCityId) next.origin = 'Select an origin city';
    if (!destinationCityId) next.destination = 'Select a destination city';
    if (originCityId && destinationCityId && originCityId === destinationCityId) {
      next.destination = 'Destination must be different from origin';
    }
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
      await createRoute({
        origin_city_id: originCityId,
        destination_city_id: destinationCityId,
      });

      const o = CITIES.find((c) => c.id === originCityId)?.name;
      const d = CITIES.find((c) => c.id === destinationCityId)?.name;
      setMessage(`Route ${o} \u2192 ${d} created successfully`);
      setOriginCityId('');
      setDestinationCityId('');
      setFieldErrors({});
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to create route'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setOriginCityId(destinationCityId);
    setDestinationCityId(originCityId);
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
            <Route size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Add a route</h1>
        </div>
        <p className="text-stone-500 text-[15px] ml-12">
          Define the origin and destination for a new route.
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
            <div className="flex items-start gap-3">
              <CityPicker
                label="Origin city"
                value={originCityId}
                onChange={(id) => {
                  setOriginCityId(id);
                  if (fieldErrors.origin) setFieldErrors((p) => ({ ...p, origin: undefined }));
                }}
                placeholder="Select origin"
                error={fieldErrors.origin}
              />

              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap origin and destination"
                className="mt-7 w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-[#101F33] hover:border-[#101F33]/30 transition-colors shrink-0"
              >
                <ArrowLeftRight size={16} />
              </button>

              <CityPicker
                label="Destination city"
                value={destinationCityId}
                onChange={(id) => {
                  setDestinationCityId(id);
                  if (fieldErrors.destination)
                    setFieldErrors((p) => ({ ...p, destination: undefined }));
                }}
                placeholder="Select destination"
                error={fieldErrors.destination}
              />
            </div>

            {/* Route preview */}
            {(originCityId || destinationCityId) && (
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3.5">
                <span className="text-[14px] font-medium text-stone-700 truncate">
                  {CITIES.find((c) => c.id === originCityId)?.name || (
                    <span className="text-stone-400">Origin</span>
                  )}
                </span>
                <div className="flex-1 h-px bg-stone-300 relative min-w-[24px]">
                  <div className="absolute right-0 -top-[3px] w-0 h-0 border-l-[6px] border-l-stone-300 border-y-[3px] border-y-transparent" />
                </div>
                <span className="text-[14px] font-medium text-stone-700 truncate">
                  {CITIES.find((c) => c.id === destinationCityId)?.name || (
                    <span className="text-stone-400">Destination</span>
                  )}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#101F33] text-white font-medium transition-all hover:bg-[#1A2D47] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Create route'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateRoute;